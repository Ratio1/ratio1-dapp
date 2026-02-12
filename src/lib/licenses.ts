import { isEmpty } from 'lodash';
import * as types from 'typedefs/blockchain';
import { getMultiNodeEpochsRange } from './api/oracles';
import { config, getCurrentEpoch } from './config';
import { PublicClient } from 'viem';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { MndRewardsBreakdown } from 'typedefs/blockchain';

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

export const getLicensesWithNodesAndRewards = (
    licenses: (BaseGNDLicense | BaseMNDLicense | BaseNDLicense)[],
    publicClient: PublicClient,
) => {
    console.log('[Licenses] getLicensesWithNodesAndRewards start', { licenses: licenses.length });
    const nodesWithRanges = licenses.reduce(
        (acc, license) => {
            acc[license.nodeAddress] = getRewardsEpochsRange(license);
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
        const availability: Promise<types.OraclesAvailabilityResult> = result.then((result) => result[license.nodeAddress]);
        let rewards: Promise<bigint | undefined>;
        let rewardsBreakdown: Promise<MndRewardsBreakdown | undefined> | undefined;

        switch (license.type) {
            case 'ND':
                rewards = getNdRewards(license, availability, config.ndVestingEpochs);
                break;

            case 'GND':
            case 'MND': {
                rewardsBreakdown = getMndOrGndRewardsBreakdown(license, availability, publicClient);
                rewards = rewardsBreakdown.then((breakdown) => breakdown?.claimableAmount);
                break;
            }

            default:
                rewards = Promise.resolve(undefined);
        }

        return {
            ...license,
            isLinked: true as const,
            rewards,
            rewardsBreakdown,
            alias: availability.then(({ node_alias }) => node_alias),
            isOnline: availability.then(({ node_is_online }) => node_is_online),
            epochs: availability.then(({ epochs }) => epochs),
            epochsAvailabilities: availability.then(({ epochs_vals }) => epochs_vals),
            ethSignatures: availability.then(({ eth_signatures }) => eth_signatures),
        };
    });

    console.log('[Licenses] getLicensesWithNodesAndRewards ready', { linked: licensesWithNodesWithRewards.length });
    return licensesWithNodesWithRewards;
};

const getRewardsEpochsRange = (license: BaseGNDLicense | BaseMNDLicense | BaseNDLicense): [number, number] => {
    const currentEpoch = getCurrentEpoch();
    const lastClaimEpoch = Number(license.lastClaimEpoch);

    if (license.totalClaimedAmount !== license.totalAssignedAmount && Number(license.lastClaimEpoch) < getCurrentEpoch()) {
        switch (license.type) {
            case 'MND':
                return getMndRewardsEpochsRange(license, currentEpoch);

            default:
                return [lastClaimEpoch, currentEpoch - 1];
        }
    } else {
        // Node already claimed current epoch rewards, so we simulate a node_last_epoch call
        return [lastClaimEpoch - 1, currentEpoch - 1];
    }
};

const getMndRewardsEpochsRange = (license: BaseMNDLicense, currentEpoch: number): [number, number] => {
    const firstEpochToClaim =
        license.lastClaimEpoch >= license.firstMiningEpoch ? Number(license.lastClaimEpoch) : Number(license.firstMiningEpoch);

    return [currentEpoch >= config.mndCliffEpochs ? firstEpochToClaim : currentEpoch - 1, currentEpoch - 1];
};

const getNdRewards = async (
    license: BaseNDLicense,
    availability: Promise<types.OraclesAvailabilityResult>,
    vestingEpochs: number,
): Promise<bigint | undefined> => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    const { epochs, epochs_vals } = await availability;

    if (!epochsToClaim) {
        return 0n;
    }

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
): Promise<MndRewardsBreakdown | undefined> => {
    const currentEpoch = getCurrentEpoch();
    const firstEpochToClaim =
        license.lastClaimEpoch >= license.firstMiningEpoch ? Number(license.lastClaimEpoch) : Number(license.firstMiningEpoch);
    const epochsToClaim = currentEpoch - firstEpochToClaim;

    const { epochs, epochs_vals } = await availability;

    if (currentEpoch < license.firstMiningEpoch || !epochsToClaim) {
        return {
            claimableAmount: 0n,
            rewardsAmount: 0n,
            carryoverAmount: 0n,
            withheldAmount: 0n,
        };
    }

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
                    epochs: epochs.map((epoch) => BigInt(epoch)),
                    availabilies: epochs_vals,
                },
            ],
        ],
    });
    if (result.length !== 1) {
        throw new Error('Invalid rewards calculation result');
    }
    return {
        claimableAmount: result[0].rewardsAmount + result[0].carryoverAmount,
        rewardsAmount: result[0].rewardsAmount,
        carryoverAmount: result[0].carryoverAmount,
        withheldAmount: result[0].withheldAmount,
    };
};
