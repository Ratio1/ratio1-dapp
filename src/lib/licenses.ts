import { isEmpty } from 'lodash';
import * as types from 'typedefs/blockchain';
import { getMultiNodeEpochsRange } from './api/oracles';
import { config, getCurrentEpoch } from './config';

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
};

type BaseGNDLicense = types.BaseLicense & {
    type: 'GND';
    isBanned: false;
    firstMiningEpoch: bigint;
};

export type { BaseGNDLicense, BaseMNDLicense, BaseNDLicense };

export const getLicensesWithNodesAndRewards = (licenses: (BaseGNDLicense | BaseMNDLicense | BaseNDLicense)[]) => {
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

    const result = getMultiNodeEpochsRange(nodesWithRanges);

    const licensesWithNodesWithRewards: types.License[] = licenses.map((license) => {
        const availability: Promise<types.OraclesAvailabilityResult> = result.then((result) => result[license.nodeAddress]);
        let rewards: Promise<bigint | undefined>;

        switch (license.type) {
            case 'ND':
                rewards = getNdOrGndRewards(license, availability, config.ndVestingEpochs);
                break;

            case 'GND':
                rewards = getNdOrGndRewards(license, availability, config.gndVestingEpochs);
                break;

            case 'MND':
                rewards = getMndRewards(license, availability);
                break;

            default:
                rewards = Promise.resolve(undefined);
        }

        return {
            ...license,
            isLinked: true as const,
            rewards,
            alias: availability.then(({ node_alias }) => node_alias),
            isOnline: availability.then(({ node_is_online }) => node_is_online),
            epochs: availability.then(({ epochs }) => epochs),
            epochsAvailabilities: availability.then(({ epochs_vals }) => epochs_vals),
            ethSignatures: availability.then(({ eth_signatures }) => eth_signatures),
        };
    });

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

const getNdOrGndRewards = async (
    license: BaseNDLicense | BaseGNDLicense,
    availability: Promise<types.OraclesAvailabilityResult>,
    vestingEpochs: number,
): Promise<bigint | undefined> => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    const { epochs, epochs_vals } = await availability;

    if (!epochsToClaim) {
        return 0n;
    }

    if (epochsToClaim !== epochs.length || epochsToClaim !== epochs_vals.length) {
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

const getMndRewards = async (
    license: BaseMNDLicense,
    availability: Promise<types.OraclesAvailabilityResult>,
): Promise<bigint | undefined> => {
    const currentEpoch = getCurrentEpoch();
    const firstEpochToClaim =
        license.lastClaimEpoch >= license.firstMiningEpoch ? Number(license.lastClaimEpoch) : Number(license.firstMiningEpoch);
    const epochsToClaim = currentEpoch - firstEpochToClaim;

    const { epochs, epochs_vals } = await availability;

    if (currentEpoch < license.firstMiningEpoch || !epochsToClaim) {
        return 0n;
    }

    if (epochsToClaim !== epochs.length || epochsToClaim !== epochs_vals.length) {
        // Oracles are still syncing
        return undefined;
    }

    let rewards_amount = 0n;
    const logisticPlateau = 392_778135785707100000n; // 392.77
    const licensePlateau = (license.totalAssignedAmount * BigInt(1e18)) / logisticPlateau;

    for (let i = 0; i < epochsToClaim; i++) {
        const maxRewardsPerEpoch = calculateMndMaxEpochRelease(license.firstMiningEpoch, licensePlateau);
        rewards_amount += (maxRewardsPerEpoch * BigInt(epochs_vals[i])) / 255n;
    }

    const maxRemainingClaimAmount = license.totalAssignedAmount - license.totalClaimedAmount;

    if (rewards_amount > maxRemainingClaimAmount) {
        return maxRemainingClaimAmount;
    }

    return rewards_amount;
};

const calculateMndMaxEpochRelease = (firstMiningEpoch: bigint, licensePlateau: bigint): bigint => {
    const currentEpoch = getCurrentEpoch();

    let x = currentEpoch - Number(firstMiningEpoch);
    if (x > config.mndVestingEpochs) {
        x = config.mndVestingEpochs;
    }
    const frac = logisticFraction(x);
    return (licensePlateau * BigInt(frac * 1e18)) / BigInt(1e18);
};

const logisticFraction = (x: number): number => {
    const length = config.mndVestingEpochs;
    const k = 3.0;
    const midPrc = 0.6;
    const midpoint = length * midPrc;
    return 1.0 / (1.0 + Math.exp((-k * (x - midpoint)) / length));
};
