import * as types from 'typedefs/blockchain';
import { getMultiNodeEpochsRange, getNodeInfo } from './api/oracles';
import { config, getCurrentEpoch } from './config';

type BaseNDLicense = types.BaseLicense & {
    type: 'ND';
    isBanned: boolean;
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

export const getLicensesWithNodesWithRewards = async (licenses: (BaseGNDLicense | BaseMNDLicense | BaseNDLicense)[]) => {
    const nodesWithRanges = licenses.reduce(
        (acc, license) => {
            acc[license.nodeAddress] = getRewardsEpochsRange(license);
            return acc;
        },
        {} as Record<types.EthAddress, [number, number]>,
    );

    const result = await getMultiNodeEpochsRange(nodesWithRanges);

    console.log(`getMultiNodeEpochsRange (${result.query_time}s)`);

    const licensesWithNodesWithRewards: types.License[] = licenses.map((license) => {
        const availability: types.OraclesAvailabilityResult = result[license.nodeAddress];
        const { epochs, epochs_vals, eth_signatures, node_alias, node_is_online } = availability;
        let rewards: bigint | undefined;

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
                rewards = undefined;
        }

        return {
            ...license,
            isLinked: true as const,
            rewards: Promise.resolve(rewards),
            alias: Promise.resolve(node_alias),
            isOnline: Promise.resolve(node_is_online),
            epochs: Promise.resolve(epochs),
            epochsAvailabilities: Promise.resolve(epochs_vals),
            ethSignatures: Promise.resolve(eth_signatures),
        };
    });

    return licensesWithNodesWithRewards;
};

export const getLicensesWithNodesWithoutRewards = async (
    licenses: (BaseGNDLicense | BaseMNDLicense | BaseNDLicense)[],
): Promise<types.License[]> => {
    const licensesWithNodes = licenses.map((license) => {
        return {
            ...license,
            isLinked: true as const,
            rewards: Promise.resolve(0n),
            alias: getNodeInfo(license.nodeAddress).then(({ node_alias }) => node_alias),
            isOnline: getNodeInfo(license.nodeAddress).then(({ node_is_online }) => node_is_online),
            epochs: Promise.resolve([]),
            epochsAvailabilities: Promise.resolve([]),
            ethSignatures: Promise.resolve([]),
        };
    });

    return licensesWithNodes;
};

const getRewardsEpochsRange = (license: BaseGNDLicense | BaseMNDLicense | BaseNDLicense): [number, number] => {
    const currentEpoch = getCurrentEpoch();
    const lastClaimEpoch = Number(license.lastClaimEpoch);

    switch (license.type) {
        case 'MND':
            return getMndRewardsEpochsRange(license, currentEpoch);

        default:
            return [lastClaimEpoch, currentEpoch - 1];
    }
};

const getMndRewardsEpochsRange = (license: BaseMNDLicense, currentEpoch: number): [number, number] => {
    const firstEpochToClaim =
        license.lastClaimEpoch >= license.firstMiningEpoch ? Number(license.lastClaimEpoch) : Number(license.firstMiningEpoch);

    return [currentEpoch >= config.mndCliffEpochs ? firstEpochToClaim : currentEpoch - 1, currentEpoch - 1];
};

const getNdOrGndRewards = (
    license: BaseNDLicense | BaseGNDLicense,
    availability: types.OraclesAvailabilityResult,
    vestingEpochs: number,
): bigint | undefined => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    const { epochs, epochs_vals } = availability;

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

const getMndRewards = (license: BaseMNDLicense, availability: types.OraclesAvailabilityResult): bigint | undefined => {
    const currentEpoch = getCurrentEpoch();
    const firstEpochToClaim =
        license.lastClaimEpoch >= license.firstMiningEpoch ? Number(license.lastClaimEpoch) : Number(license.firstMiningEpoch);
    const epochsToClaim = currentEpoch - firstEpochToClaim;

    const { epochs, epochs_vals } = availability;

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
