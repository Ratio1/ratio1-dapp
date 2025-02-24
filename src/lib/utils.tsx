import { Button } from '@nextui-org/button';
import { throttle } from 'lodash';
import toast from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';
import { EthAddress, GNDLicense, License, MNDLicense, PriceTier } from 'typedefs/blockchain';
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

export const getNodeAndLicenseRewards = async (
    license: License,
): Promise<{
    node_alias?: string;
    node_is_online: boolean;
    rewards_amount: bigint;
    epochs: number[];
    epochs_vals: number[];
    eth_signatures: EthAddress[];
}> => {
    let nodeAndLicenseRewards: {
        rewards_amount: bigint;
        epochs: number[];
        epochs_vals: number[];
        eth_signatures: EthAddress[];
        node_alias?: string;
        node_is_online: boolean;
    } = {
        rewards_amount: 0n,
        epochs: [],
        epochs_vals: [],
        eth_signatures: [],
        node_alias: undefined,
        node_is_online: false,
    };

    try {
        if (license.totalClaimedAmount !== license.totalAssignedAmount && Number(license.lastClaimEpoch) < getCurrentEpoch()) {
            switch (license.type) {
                case 'ND':
                    nodeAndLicenseRewards = await getNdNodeAndLicenseRewards(license);
                    break;

                case 'MND':
                    nodeAndLicenseRewards = await getMndNodeAndLicenseRewards(license);
                    break;

                case 'GND':
                    nodeAndLicenseRewards = await getGndNodeAndLicenseRewards(license);
                    break;
            }
        } else {
            const { node_alias, node_is_online } = await getNodeInfo(license.nodeAddress);

            return {
                ...nodeAndLicenseRewards,
                node_alias,
                node_is_online,
            };
        }
    } catch (error: any) {
        if (error.message.includes('Oracle state is not valid')) {
            console.error(`(License #${license.licenseId}) [${getShortAddress(license.nodeAddress)}]`, error.message);
        } else {
            console.error(error);
        }

        if (!error.message.includes('Error converting node address')) {
            throttledToastError('An error occurred while loading one of your licenses.');
        }
    }

    return nodeAndLicenseRewards;
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
                    minWidth: '386px',
                },
            },
        );
    },
    5000,
    { trailing: false },
);

const getNdNodeAndLicenseRewards = async (
    license: License,
): Promise<{
    rewards_amount: bigint;
    epochs: number[];
    epochs_vals: number[];
    eth_signatures: EthAddress[];
    node_alias: string;
    node_is_online: boolean;
}> => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    const { epochs, epochs_vals, eth_signatures, node_alias, node_is_online } = await getNodeEpochsRange(
        license.nodeAddress,
        Number(license.lastClaimEpoch),
        currentEpoch - 1,
    );

    const baseResult = {
        rewards_amount: 0n,
        epochs: [],
        epochs_vals: [],
        eth_signatures: [],
        node_alias,
        node_is_online,
    };

    if (epochsToClaim <= 0) {
        return baseResult;
    }

    if (epochsToClaim !== epochs.length || epochsToClaim !== epochs_vals.length) {
        throw new Error('Invalid epochs array length');
    }

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(config.ndVestingEpochs);
    let rewards_amount = 0n;

    for (let i = 0; i < epochsToClaim; i++) {
        rewards_amount += (maxRewardsPerEpoch * BigInt(epochs_vals[i])) / 255n;
    }

    const maxRemainingClaimAmount = license.totalAssignedAmount - license.totalClaimedAmount;

    if (rewards_amount > maxRemainingClaimAmount) {
        return {
            ...baseResult,
            rewards_amount: maxRemainingClaimAmount,
            epochs,
            epochs_vals,
            eth_signatures,
        };
    }

    return {
        ...baseResult,
        rewards_amount,
        epochs,
        epochs_vals,
        eth_signatures,
    };
};

const getGndNodeAndLicenseRewards = async (
    license: GNDLicense,
): Promise<{
    rewards_amount: bigint;
    epochs: number[];
    epochs_vals: number[];
    eth_signatures: EthAddress[];
    node_alias: string;
    node_is_online: boolean;
}> => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    const { epochs, epochs_vals, eth_signatures, node_alias, node_is_online } = await getNodeEpochsRange(
        license.nodeAddress,
        Number(license.lastClaimEpoch),
        currentEpoch - 1,
    );

    const baseResult = {
        rewards_amount: 0n,
        epochs: [],
        epochs_vals: [],
        eth_signatures: [],
        node_alias,
        node_is_online,
    };

    if (epochsToClaim <= 0) {
        return baseResult;
    }

    if (epochsToClaim !== epochs.length || epochsToClaim !== epochs_vals.length) {
        throw new Error('Invalid epochs array length');
    }

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(config.gndVestingEpochs);
    let rewards_amount = 0n;

    for (let i = 0; i < epochsToClaim; i++) {
        rewards_amount += (maxRewardsPerEpoch * BigInt(epochs_vals[i])) / 255n;
    }

    const maxRemainingClaimAmount = license.totalAssignedAmount - license.totalClaimedAmount;

    if (rewards_amount > maxRemainingClaimAmount) {
        return {
            ...baseResult,
            rewards_amount: maxRemainingClaimAmount,
            epochs,
            epochs_vals,
            eth_signatures,
        };
    }
    return {
        ...baseResult,
        rewards_amount,
        epochs,
        epochs_vals,
        eth_signatures,
    };
};

const getMndNodeAndLicenseRewards = async (
    license: MNDLicense,
): Promise<{
    rewards_amount: bigint;
    epochs: number[];
    epochs_vals: number[];
    eth_signatures: EthAddress[];
    node_alias: string;
    node_is_online: boolean;
}> => {
    const currentEpoch = getCurrentEpoch();

    const firstEpochToClaim =
        license.lastClaimEpoch >= config.mndCliffEpochs ? Number(license.lastClaimEpoch) : config.mndCliffEpochs;
    const epochsToClaim = currentEpoch - firstEpochToClaim;

    const { epochs, epochs_vals, eth_signatures, node_alias, node_is_online } = await getNodeEpochsRange(
        license.nodeAddress,
        firstEpochToClaim,
        currentEpoch - 1,
    );

    const baseResult = {
        rewards_amount: 0n,
        epochs: [],
        epochs_vals: [],
        eth_signatures: [],
        node_alias,
        node_is_online,
    };

    if (currentEpoch < config.mndCliffEpochs || epochsToClaim === 0) {
        return baseResult;
    }

    if (epochsToClaim !== epochs.length || epochsToClaim !== epochs_vals.length) {
        throw new Error('Invalid epochs array length');
    }

    const maxRewardsPerEpoch = license.totalAssignedAmount / BigInt(config.mndVestingEpochs);
    let rewards_amount = 0n;

    for (let i = 0; i < epochsToClaim; i++) {
        rewards_amount += (maxRewardsPerEpoch * BigInt(epochs_vals[i])) / 255n;
    }

    const maxRemainingClaimAmount = license.totalAssignedAmount - license.totalClaimedAmount;

    if (rewards_amount > maxRemainingClaimAmount) {
        return {
            ...baseResult,
            rewards_amount: maxRemainingClaimAmount,
            epochs,
            epochs_vals,
            eth_signatures,
        };
    }

    return {
        ...baseResult,
        rewards_amount,
        epochs,
        epochs_vals,
        eth_signatures,
    };
};

export const arrayAverage = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const getLicenseSectionHeader = (type: License['type']) => (
    <div className="mx-auto">
        <div className="pt-4 text-2xl font-semibold">{type}</div>
    </div>
);

export const INITIAL_TIERS_STATE: PriceTier[] = [
    {
        index: 1,
        usdPrice: 500,
        totalUnits: 89,
        soldUnits: 0,
    },
    {
        index: 2,
        usdPrice: 750,
        totalUnits: 144,
        soldUnits: 0,
    },
    {
        index: 3,
        usdPrice: 1000,
        totalUnits: 233,
        soldUnits: 0,
    },
    {
        index: 4,
        usdPrice: 1500,
        totalUnits: 377,
        soldUnits: 0,
    },
    {
        index: 5,
        usdPrice: 2000,
        totalUnits: 610,
        soldUnits: 0,
    },
    {
        index: 6,
        usdPrice: 2500,
        totalUnits: 987,
        soldUnits: 0,
    },
    {
        index: 7,
        usdPrice: 3000,
        totalUnits: 1597,
        soldUnits: 0,
    },
    {
        index: 8,
        usdPrice: 3500,
        totalUnits: 2584,
        soldUnits: 0,
    },
    {
        index: 9,
        usdPrice: 4000,
        totalUnits: 4181,
        soldUnits: 0,
    },
    {
        index: 10,
        usdPrice: 5000,
        totalUnits: 6765,
        soldUnits: 0,
    },
    {
        index: 11,
        usdPrice: 7000,
        totalUnits: 10946,
        soldUnits: 0,
    },
    {
        index: 12,
        usdPrice: 9500,
        totalUnits: 17711,
        soldUnits: 0,
    },
];
