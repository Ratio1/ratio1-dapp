import { isEmpty } from 'lodash';
import * as types from 'typedefs/blockchain';
import { getMultiNodeEpochsRange } from './api/oracles';
import { config, getCurrentEpoch } from './config';
import { PublicClient } from 'viem';
import { MNDContractAbi } from '@blockchain/MNDContract';

type BaseNDLicense = types.BaseLicense & {
    type: 'ND';
    isBanned: boolean;
    usdcPoaiRewards: bigint;
    r1PoaiRewards: bigint;
};

type BaseMNDLicense = types.BaseLicense & {
    type: 'MND';
    isBanned: false;
    firstMiningEpoch: bigint;
    awbBalance: bigint;
};

type BaseGNDLicense = types.BaseLicense & {
    type: 'GND';
    isBanned: false;
    firstMiningEpoch: bigint;
    awbBalance: bigint;
};

export type { BaseGNDLicense, BaseMNDLicense, BaseNDLicense };

// Claim details are often consumed only after the owner opens a card. Keep their original
// rejection available to that caller while avoiding unhandled rejections during an oracle outage.
const observeDeferred = <T>(promise: Promise<T>): Promise<T> => {
    void promise.catch(() => undefined);
    return promise;
};

// Signed claim fields can be unavailable even when the HTTP response and other nodes are valid.
const requireSignedAvailability = (
    row: types.OraclesAvailabilityResult,
    address: types.EthAddress,
    [from, to]: [number, number],
): types.OraclesAvailabilityResult => {
    if (row.error) throw new Error(row.error);
    if (row.node_eth_address?.toLowerCase() !== address.toLowerCase() || row.from_epoch !== from || row.to_epoch !== to) {
        throw new Error('Oracle returned a different node or epoch range');
    }
    // Preserve the exact signed range. A partial answer must never look like a confirmed zero.
    if (!Array.isArray(row.epochs) || !Array.isArray(row.epochs_vals) || to < from ||
        row.epochs.length !== to - from + 1 || row.epochs_vals.length !== row.epochs.length ||
        row.epochs.some((epoch, i) => epoch !== from + i)) {
        throw new Error('Oracle returned incomplete epoch data');
    }
    if (!Array.isArray(row.eth_signatures) || !row.eth_signatures.length ||
        row.eth_signatures.some((sig) => typeof sig !== 'string' || !/^0x[0-9a-f]{130}$/i.test(sig)) ||
        row.packed_availabilities?.toLowerCase() !== packedAvailabilitiesFromValues(row.epochs_vals)) {
        throw new Error('Oracle returned incomplete claim data');
    }
    return row;
};

export const getLicensesWithNodesAndRewards = (
    licenses: (BaseGNDLicense | BaseMNDLicense | BaseNDLicense)[],
    publicClient: PublicClient,
) => {
    console.log('[Licenses] getLicensesWithNodesAndRewards start', { licenses: licenses.length });
    const currentEpoch = getCurrentEpoch();  // One epoch governs the request, its signed range and its calculation.
    const lastClosedEpoch = Math.max(0, currentEpoch - 1);
    const nodesWithRanges = licenses.reduce(
        (acc, license) => {
            // A settled or pre-mining license still requests a closed epoch for metadata and signed details.
            acc[license.nodeAddress] = [Math.min(firstEpochToClaim(license), lastClosedEpoch), lastClosedEpoch];
            return acc;
        },
        {} as Record<types.EthAddress, [number, number]>,
    );

    if (isEmpty(nodesWithRanges)) {
        console.log('[getLicensesWithNodesAndRewards] No licenses linked');

        return licenses.map((license) => ({
            ...license,
            isLinked: false as const,
        }));
    }

    console.log('[Licenses] getMultiNodeEpochsRange request', { nodes: Object.keys(nodesWithRanges).length });
    const rewardsCheckedAt = Date.now();
    const result = getMultiNodeEpochsRange(nodesWithRanges)
        .then((response) => {
            console.log('[Licenses] getMultiNodeEpochsRange success', { nodes: Object.keys(nodesWithRanges).length });
            return response;
        })
        .catch((error) => {
            console.error('[Licenses] getMultiNodeEpochsRange failed', { nodes: Object.keys(nodesWithRanges).length, error });
            throw error;
        });

    const licensesWithNodesWithRewards: types.License[] = licenses.map((license) => {
        const availability = result.then((batch) => {
            const row = batch[license.nodeAddress];
            if (!row) throw new Error('Oracle did not return the requested node');
            return row;
        });
        const signedAvailability = observeDeferred(availability.then((row) =>
            requireSignedAvailability(row, license.nodeAddress, nodesWithRanges[license.nodeAddress]),
        ));
        // Metadata can still describe the node when its requested claim range is unavailable.
        const field = <K extends keyof types.OraclesAvailabilityResult>(key: K, source = signedAvailability) =>
            observeDeferred(source.then((row) => row[key]));
        let rewards: Promise<bigint | undefined>;
        let rewardsBreakdown: Promise<types.MndRewardsBreakdown | undefined> | undefined;

        switch (license.type) {
            case 'ND':
                rewards = getNdRewards(license, signedAvailability, config.ndVestingEpochs, currentEpoch);
                break;

            case 'GND':
            case 'MND': {
                rewardsBreakdown = getMndOrGndRewardsBreakdown(license, signedAvailability, publicClient, currentEpoch);
                rewards = rewardsBreakdown.then((breakdown) =>
                    breakdown ? breakdown.rewardsAmount + breakdown.carryoverAmount : undefined,
                );
                break;
            }

            default:
                rewards = Promise.resolve(undefined);
        }

        return {
            ...license,
            isLinked: true as const,
            rewardsCheckedAt,
            rewards: observeDeferred(rewards),
            rewardsBreakdown: rewardsBreakdown && observeDeferred(rewardsBreakdown),
            alias: field('node_alias', availability),
            isOnline: field('node_is_online', availability),
            epochs: field('epochs'),
            epochsAvailabilities: field('epochs_vals'),
            fromEpoch: field('from_epoch'),
            toEpoch: field('to_epoch'),
            packedAvailabilities: field('packed_availabilities'),
            ethSignatures: field('eth_signatures'),
        };
    });

    console.log('[Licenses] getLicensesWithNodesAndRewards ready', { linked: licensesWithNodesWithRewards.length });
    return licensesWithNodesWithRewards;
};

// The mining contract records each license's own start, including the genesis license at epoch one.
const firstEpochToClaim = (license: BaseGNDLicense | BaseMNDLicense | BaseNDLicense): number =>
    license.type === 'ND' ? Number(license.lastClaimEpoch) : Math.max(Number(license.lastClaimEpoch), Number(license.firstMiningEpoch));

const getNdRewards = async (
    license: BaseNDLicense,
    availability: Promise<types.OraclesAvailabilityResult>,
    vestingEpochs: number,
    currentEpoch: number,
): Promise<bigint | undefined> => {
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    // The current on-chain claim epoch or a fully exhausted ND allocation establishes a zero balance.
    if (epochsToClaim === 0 || license.totalClaimedAmount === license.totalAssignedAmount) {
        return 0n;
    }

    const { epochs, epochs_vals } = await availability;
    if (epochsToClaim !== epochs?.length || epochsToClaim !== epochs_vals?.length) {
        // Oracles are still syncing
        return undefined;
    }

    let rewards_amount = 0n;
    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(vestingEpochs);

    for (let i = 0; i < epochsToClaim; i++) {
        rewards_amount += (maxRewardsPerEpoch * BigInt(epochs_vals[i])) / 255n;
    }

    const maxRemainingClaimAmount = license.totalAssignedAmount - license.totalClaimedAmount;

    if (rewards_amount > maxRemainingClaimAmount) {
        return maxRemainingClaimAmount;
    }

    return rewards_amount;
};

const getMndOrGndRewardsBreakdown = async (
    license: BaseMNDLicense | BaseGNDLicense,
    availability: Promise<types.OraclesAvailabilityResult>,
    publicClient: PublicClient,
    currentEpoch: number,
): Promise<types.MndRewardsBreakdown | undefined> => {
    const epochsToClaim = currentEpoch - firstEpochToClaim(license);

    // MND/GND carryover and withholding require the contract once there are epochs to claim.
    const fullySettled = license.totalClaimedAmount === license.totalAssignedAmount && license.awbBalance === 0n;
    if (epochsToClaim <= 0 || fullySettled) {
        return {
            rewardsAmount: 0n,
            carryoverAmount: 0n,
            withheldAmount: 0n,
        };
    }

    const { epochs, epochs_vals } = await availability;
    if (epochsToClaim !== epochs?.length || epochsToClaim !== epochs_vals?.length) {
        // Oracles are still syncing
        return undefined;
    }

    //TODO rewards calculation and claiming will fail if there are more than ~1000 epochs to claim
    const result = await publicClient.readContract({
        address: config.mndContractAddress,
        abi: MNDContractAbi,
        functionName: 'calculateRewards',
        args: [
            [
                {
                    licenseId: license.licenseId,
                    nodeAddress: license.nodeAddress,
                    fromEpoch: BigInt(epochs[0]),
                    toEpoch: BigInt(epochs[epochs.length - 1]),
                    packedAvailabilities: packedAvailabilitiesFromValues(epochs_vals),
                },
            ],
        ],
    });
    if (result.length !== 1) {
        throw new Error('Invalid rewards calculation result');
    }
    return {
        rewardsAmount: result[0].rewardsAmount,
        carryoverAmount: result[0].carryoverAmount,
        withheldAmount: result[0].withheldAmount,
    };
};

const packedAvailabilitiesFromValues = (availabilities: number[]): `0x${string}` => {
    const bytes = availabilities.map((availability) => {
        if (!Number.isInteger(availability) || availability < 0 || availability > 255) {
            throw new Error(`Invalid availability value ${availability}`);
        }
        return availability.toString(16).padStart(2, '0');
    });
    return `0x${bytes.join('')}`;
};
