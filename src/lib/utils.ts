import { throttle } from 'lodash';
import toast from 'react-hot-toast';
import { GNDLicense, License, MNDLicense } from 'typedefs/blockchain';
import { getNodeEpochsRange, getNodeInfo } from './api/oracles';
import {
    epochDurationInSeconds,
    genesisDate,
    gndVestingEpochs,
    mndCliffEpochs,
    mndVestingEpochs,
    ndVestingEpochs,
} from './config';

export const getShortAddress = (address: string, size = 4) => `${address.slice(0, size)}...${address.slice(-size)}`;

export function fN(num: number): string {
    if (num >= 1000) {
        const formattedNum = num / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${formattedNum.toFixed(1)}K`;
    }
    return num.toString();
}

export function fBI(num: bigint, decimals: number): string {
    num = num / 10n ** BigInt(decimals);
    if (num >= 1_000_000n) {
        const formattedNum = Number(num) / 1_000_000;
        return formattedNum % 1 === 0 ? `${formattedNum}M` : `${formattedNum.toFixed(1)}M`;
    }
    if (num >= 1000n) {
        const formattedNum = Number(num) / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${formattedNum.toFixed(1)}K`;
    }
    return num.toString();
}

export const getCurrentEpoch = () => Math.floor((Date.now() / 1000 - genesisDate.getTime() / 1000) / epochDurationInSeconds);

export const getLicenseRewardsAndNodeInfo = async (
    license: License,
): Promise<{ node_alias: string; node_is_online: boolean; rewards_amount: bigint }> => {
    const nodeInfo = await getNodeInfo(license.nodeAddress);
    let rewards_amount: bigint = 0n;

    try {
        if (license.totalClaimedAmount !== license.totalAssignedAmount) {
            switch (license.type) {
                case 'ND':
                    rewards_amount = await getNdLicenseRewards(license);
                    break;

                case 'MND':
                    rewards_amount = await getMndLicenseRewards(license);
                    break;

                case 'GND':
                    rewards_amount = await getGndLicenseRewards(license);
                    break;
            }
        }
    } catch (error) {
        console.error(error);
        throttledToastError('Error loading license rewards.');
    }

    return {
        rewards_amount,
        ...nodeInfo,
    };
};

export const throttledToastError = throttle(
    (message: string) => {
        toast.error(message);
    },
    5000,
    { trailing: false },
);

const getNdLicenseRewards = async (license: License): Promise<bigint> => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    if (epochsToClaim <= 0) {
        return 0n;
    }

    const nodeEpochsRange = await getNodeEpochsRange(license.nodeAddress, Number(license.lastClaimEpoch), currentEpoch - 1);

    if (epochsToClaim !== nodeEpochsRange.epochs.length || epochsToClaim !== nodeEpochsRange.epochs_vals.length) {
        throw new Error('Invalid epochs array length');
    }

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(ndVestingEpochs);
    let rewards_amount = 0n;

    for (let i = 0; i < epochsToClaim; i++) {
        rewards_amount += (maxRewardsPerEpoch * BigInt(nodeEpochsRange.epochs_vals[i])) / 255n;
    }

    const maxRemainingClaimAmount = license.totalAssignedAmount - license.totalClaimedAmount;

    if (rewards_amount > maxRemainingClaimAmount) {
        return maxRemainingClaimAmount;
    }

    return rewards_amount;
};

const getGndLicenseRewards = async (license: GNDLicense): Promise<bigint> => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    if (epochsToClaim <= 0) {
        return 0n;
    }

    const { node_alias, ...nodeEpochsRange } = await getNodeEpochsRange(
        license.nodeAddress,
        Number(license.lastClaimEpoch),
        currentEpoch - 1,
    );

    if (epochsToClaim !== nodeEpochsRange.epochs.length || epochsToClaim !== nodeEpochsRange.epochs_vals.length) {
        throw new Error('Invalid epochs array length');
    }

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(gndVestingEpochs);
    let rewards_amount = 0n;

    for (let i = 0; i < epochsToClaim; i++) {
        rewards_amount += (maxRewardsPerEpoch * BigInt(nodeEpochsRange.epochs_vals[i])) / 255n;
    }

    const maxRemainingClaimAmount = license.totalAssignedAmount - license.totalClaimedAmount;

    if (rewards_amount > maxRemainingClaimAmount) {
        return maxRemainingClaimAmount;
    }
    return rewards_amount;
};

const getMndLicenseRewards = async (license: MNDLicense): Promise<bigint> => {
    const currentEpoch = getCurrentEpoch();
    if (currentEpoch < mndCliffEpochs) {
        return 0n;
    }

    const firstEpochToClaim = license.lastClaimEpoch >= mndCliffEpochs ? Number(license.lastClaimEpoch) : mndCliffEpochs;
    const epochsToClaim = currentEpoch - firstEpochToClaim;

    if (epochsToClaim === 0) {
        return 0n;
    }

    const { node_alias, ...nodeEpochsRange } = await getNodeEpochsRange(
        license.nodeAddress,
        Number(license.lastClaimEpoch),
        currentEpoch - 1,
    );

    if (epochsToClaim !== nodeEpochsRange.epochs.length || epochsToClaim !== nodeEpochsRange.epochs_vals.length) {
        throw new Error('Invalid epochs array length');
    }

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(mndVestingEpochs);
    let licenseRewards = 0n;

    for (let i = 0; i < epochsToClaim; i++) {
        licenseRewards += (maxRewardsPerEpoch * BigInt(nodeEpochsRange.epochs_vals[i])) / 255n;
    }

    const maxRemainingClaimAmount = license.totalAssignedAmount - license.totalClaimedAmount;

    if (licenseRewards > maxRemainingClaimAmount) {
        return maxRemainingClaimAmount;
    }

    return licenseRewards;
};
