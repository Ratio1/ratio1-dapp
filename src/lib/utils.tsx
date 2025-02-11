import { Button } from '@nextui-org/button';
import { throttle } from 'lodash';
import toast from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';
import { GNDLicense, License, MNDLicense } from 'typedefs/blockchain';
import { getNodeEpochsRange, getNodeInfo } from './api/oracles';
import { config, getCurrentEpoch } from './config';

export const getShortAddress = (address: string, size = 4) => `${address.slice(0, size)}...${address.slice(-size)}`;

export function fN(num: number): string | number {
    if (num >= 1_000_000) {
        const formattedNum = num / 1_000_000;
        return formattedNum % 1 === 0 ? `${formattedNum}M` : `${parseFloat(formattedNum.toFixed(2))}M`;
    }

    if (num >= 1000) {
        const formattedNum = num / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${parseFloat(formattedNum.toFixed(2))}K`;
    }

    return parseFloat(num.toFixed(2));
}

export function fBI(num: bigint, decimals: number): string {
    num = num / 10n ** BigInt(decimals);
    if (num >= 1_000_000n) {
        const formattedNum = Number(num) / 1_000_000;
        return formattedNum % 1 === 0 ? `${formattedNum}M` : `${parseFloat(formattedNum.toFixed(2))}M`;
    }
    if (num >= 1000n) {
        const formattedNum = Number(num) / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${parseFloat(formattedNum.toFixed(2))}K`;
    }
    return num.toString();
}

export const getLicenseRewardsAndNodeInfo = async (
    license: License,
): Promise<{ node_alias: string; node_is_online: boolean; rewards_amount: bigint }> => {
    let nodeInfo = {
        node_alias: '',
        node_is_online: false,
    };
    let rewards_amount: bigint = 0n;

    if (getCurrentEpoch() > 1) {
        try {
            nodeInfo = await getNodeInfo(license.nodeAddress);
        } catch (error) {
            console.error(error);
            throttledToastError('Error loading license rewards and node data.');
        }

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
            throttledToastError('Error loading license rewards and node data.');
        }
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

export const throttledToastOracleError = throttle(
    () => {
        toast(
            (t) => (
                <div className="row gap-3">
                    <div className="flex">
                        <RiCodeSSlashLine className="text-2xl text-red-600" />
                    </div>

                    <div>Oracle state is not valid, please contact the development team.</div>

                    <Button size="sm" color="default" variant="flat" onPress={() => toast.dismiss(t.id)}>
                        <div className="text-sm">Close</div>
                    </Button>
                </div>
            ),
            {
                duration: 10000,
                style: {
                    minWidth: '388px',
                },
            },
        );
    },
    5000,
    { trailing: false },
);

const getNdLicenseRewards = async (license: License): Promise<bigint> => {
    // console.log('getNdLicenseRewards', license);
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    if (epochsToClaim <= 0) {
        return 0n;
    }

    const nodeEpochsRange = await getNodeEpochsRange(license.nodeAddress, Number(license.lastClaimEpoch), currentEpoch - 1);

    if (epochsToClaim !== nodeEpochsRange.epochs.length || epochsToClaim !== nodeEpochsRange.epochs_vals.length) {
        throw new Error('Invalid epochs array length');
    }

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(config.ndVestingEpochs);
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

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(config.gndVestingEpochs);
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
    // console.log('getMndLicenseRewards', license);
    const currentEpoch = getCurrentEpoch();
    if (currentEpoch < config.mndCliffEpochs) {
        return 0n;
    }

    const firstEpochToClaim =
        license.lastClaimEpoch >= config.mndCliffEpochs ? Number(license.lastClaimEpoch) : config.mndCliffEpochs;
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

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(config.mndVestingEpochs);
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

export const arrayAverage = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const getLicenseSectionHeader = (type: License['type']) => (
    <div className="mx-auto xl:mx-0">
        <div className="pt-4 text-xl font-semibold sm:text-2xl">{type}</div>
    </div>
);
