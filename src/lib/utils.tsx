import { Button } from '@nextui-org/button';
import { throttle } from 'lodash';
import toast from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';
import { EthAddress, GNDLicense, License, MNDLicense } from 'typedefs/blockchain';
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
): Promise<{
    node_alias: string;
    node_is_online: boolean;
    rewards_amount: bigint;
    epochs: number[];
    epochs_vals: number[];
    eth_signatures: EthAddress[];
}> => {
    let nodeInfo = {
        node_alias: '',
        node_is_online: false,
    };
    let rewards_info: { rewards_amount: bigint; epochs: number[]; epochs_vals: number[]; eth_signatures: EthAddress[] } = {
        rewards_amount: 0n,
        epochs: [],
        epochs_vals: [],
        eth_signatures: [],
    };

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
                        rewards_info = await getNdLicenseRewards(license);
                        break;

                    case 'MND':
                        rewards_info = await getMndLicenseRewards(license);
                        break;

                    case 'GND':
                        rewards_info = await getGndLicenseRewards(license);
                        break;
                }
            }
        } catch (error) {
            console.error(error);
            throttledToastError('Error loading license rewards and node data.');
        }
    }

    return {
        ...rewards_info,
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
                    minWidth: '360px',
                },
            },
        );
    },
    5000,
    { trailing: false },
);

const getNdLicenseRewards = async (
    license: License,
): Promise<{
    rewards_amount: bigint;
    epochs: number[];
    epochs_vals: number[];
    eth_signatures: EthAddress[];
}> => {
    // console.log('getNdLicenseRewards', license);
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    if (epochsToClaim <= 0) {
        return {
            rewards_amount: 0n,
            epochs: [],
            epochs_vals: [],
            eth_signatures: [],
        };
    }

    const { epochs, epochs_vals, eth_signatures } = await getNodeEpochsRange(
        license.nodeAddress,
        Number(license.lastClaimEpoch),
        currentEpoch - 1,
    );

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
            rewards_amount: maxRemainingClaimAmount,
            epochs,
            epochs_vals,
            eth_signatures,
        };
    }

    return {
        rewards_amount,
        epochs,
        epochs_vals,
        eth_signatures,
    };
};

const getGndLicenseRewards = async (
    license: GNDLicense,
): Promise<{
    rewards_amount: bigint;
    epochs: number[];
    epochs_vals: number[];
    eth_signatures: EthAddress[];
}> => {
    const currentEpoch = getCurrentEpoch();
    const epochsToClaim = currentEpoch - Number(license.lastClaimEpoch);

    if (epochsToClaim <= 0) {
        return {
            rewards_amount: 0n,
            epochs: [],
            epochs_vals: [],
            eth_signatures: [],
        };
    }

    const { epochs, epochs_vals, eth_signatures } = await getNodeEpochsRange(
        license.nodeAddress,
        Number(license.lastClaimEpoch),
        currentEpoch - 1,
    );

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
            rewards_amount: maxRemainingClaimAmount,
            epochs,
            epochs_vals,
            eth_signatures,
        };
    }
    return {
        rewards_amount,
        epochs,
        epochs_vals,
        eth_signatures,
    };
};

const getMndLicenseRewards = async (
    license: MNDLicense,
): Promise<{
    rewards_amount: bigint;
    epochs: number[];
    epochs_vals: number[];
    eth_signatures: EthAddress[];
}> => {
    // console.log('getMndLicenseRewards', license);
    const currentEpoch = getCurrentEpoch();
    if (currentEpoch < config.mndCliffEpochs) {
        return {
            rewards_amount: 0n,
            epochs: [],
            epochs_vals: [],
            eth_signatures: [],
        };
    }

    const firstEpochToClaim =
        license.lastClaimEpoch >= config.mndCliffEpochs ? Number(license.lastClaimEpoch) : config.mndCliffEpochs;
    const epochsToClaim = currentEpoch - firstEpochToClaim;

    if (epochsToClaim === 0) {
        return {
            rewards_amount: 0n,
            epochs: [],
            epochs_vals: [],
            eth_signatures: [],
        };
    }

    const { epochs, epochs_vals, eth_signatures } = await getNodeEpochsRange(
        license.nodeAddress,
        firstEpochToClaim,
        currentEpoch - 1,
    );

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
            rewards_amount: maxRemainingClaimAmount,
            epochs,
            epochs_vals,
            eth_signatures,
        };
    }

    return {
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
