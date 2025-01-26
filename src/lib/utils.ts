import { GNDLicense, License, MNDLicense, NDLicense } from 'types';
import { epochDuration, genesisDate, gndVestingEpochs, mndCliffEpochs, mndVestingEpochs, ndVestingEpochs } from './config';
import { getNodeAlias, getNodeEpochsRange } from './api/oracles';

export const getShortAddress = (address: string, size = 4) => `${address.slice(0, size)}...${address.slice(-size)}`;

export function fN(num: number): string {
    if (num >= 1000) {
        const formattedNum = num / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${formattedNum.toFixed(1)}K`;
    }
    return num.toString();
}

export function fNBigInt(num: bigint, decimals: number): string {
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

export const getCurrentEpoch = () => Math.floor((Date.now() / 1000 - genesisDate.getTime() / 1000) / epochDuration);

export const getLicenseRewardsAndName = async (
    license: Pick<License, 'type' | 'totalClaimedAmount' | 'totalAssignedAmount' | 'lastClaimEpoch' | 'nodeAddress'>,
) => {
    if (license.totalClaimedAmount === license.totalAssignedAmount) {
        return {
            rewards_amount: 0n,
            node_alias: await getNodeAlias(license.nodeAddress),
        };
    }
    switch (license.type) {
        //TODO: "as" should not be required, check if it's a bug
        case 'ND':
            return getNdLicenseRewardsAndName(license as NDLicense);
        case 'MND':
            return getMndLicenseRewardsAndName(license as MNDLicense);
        case 'GND':
            return getGndLicenseRewardsAndName(license as GNDLicense);
    }
};

const getNdLicenseRewardsAndName = async (license: NDLicense) => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);
    if (epochsToClaim <= 0) {
        return {
            rewards_amount: 0n,
            node_alias: await getNodeAlias(license.nodeAddress),
        };
    }

    const { node_alias, ...nodeEpochsRange } = await getNodeEpochsRange(
        license.nodeAddress,
        Number(license.lastClaimEpoch),
        currentEpoch - 1,
    );
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
        return { rewards_amount: maxRemainingClaimAmount, node_alias };
    }
    return { rewards_amount, node_alias };
};

const getGndLicenseRewardsAndName = async (license: GNDLicense) => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);
    if (epochsToClaim <= 0) {
        return { rewards_amount: 0n, node_alias: await getNodeAlias(license.nodeAddress) };
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
        return { rewards_amount: maxRemainingClaimAmount, node_alias };
    }
    return { rewards_amount, node_alias };
};

const getMndLicenseRewardsAndName = async (license: MNDLicense) => {
    const currentEpoch = getCurrentEpoch();
    if (currentEpoch < mndCliffEpochs) {
        return { rewards_amount: 0n, node_alias: await getNodeAlias(license.nodeAddress) };
    }

    const firstEpochToClaim = license.lastClaimEpoch >= mndCliffEpochs ? Number(license.lastClaimEpoch) : mndCliffEpochs;
    const epochsToClaim = currentEpoch - firstEpochToClaim;
    if (epochsToClaim === 0) {
        return { rewards_amount: 0n, node_alias: await getNodeAlias(license.nodeAddress) };
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
        return { rewards_amount: maxRemainingClaimAmount, node_alias };
    }
    return { rewards_amount: licenseRewards, node_alias };
};
