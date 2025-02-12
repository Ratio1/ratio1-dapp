import { ERC20Abi } from '@blockchain/ERC20';
import { LiquidityManagerAbi } from '@blockchain/LiquidityManager';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiExternalLinkLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { License } from 'typedefs/blockchain';
import { TransactionReceipt } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { config } from '../config';
import { getLicenseRewardsAndNodeInfo } from '../utils';

export interface BlockchainContextType {
    watchTx: (txHash: string, publicClient: any) => Promise<void>;
    fetchLicenses: () => Promise<Array<License>>;

    // R1 Balance
    r1Balance: bigint;
    setR1Balance: React.Dispatch<React.SetStateAction<bigint>>;
    fetchR1Balance: () => void;

    // R1 Price
    r1Price: bigint;
    fetchR1Price: () => void;
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useBlockchainContext = () => useContext(BlockchainContext);

export const BlockchainProvider = ({ children }) => {
    const [r1Balance, setR1Balance] = useState<bigint>(0n);
    const [r1Price, setR1Price] = useState<bigint>(0n);

    const { address } = useAccount();
    const publicClient = usePublicClient();

    useEffect(() => {
        if (publicClient && address) {
            fetchR1Balance();
        }
    }, [address, publicClient]);

    const fetchR1Balance = () => {
        if (publicClient && address) {
            publicClient
                .readContract({
                    address: config.r1ContractAddress,
                    abi: ERC20Abi,
                    functionName: 'balanceOf',
                    args: [address],
                })
                .then(setR1Balance);
        }
    };

    const watchTx = async (txHash: string, publicClient) => {
        const waitForTx = async (): Promise<TransactionReceipt> => {
            try {
                const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

                if (receipt.status === 'success') {
                    console.log('Transaction confirmed successfully!', receipt);
                    return receipt;
                } else {
                    throw new Error('Transaction failed, please try again.');
                }
            } catch (error: any) {
                console.error(error.message || error);
                throw error;
            }
        };

        toast.promise(
            waitForTx(),
            {
                loading: 'Transaction loading...',
                success: (receipt) => (
                    <div className="col">
                        <div className="font-medium">Transaction confirmed</div>
                        <div className="row gap-1 text-sm">
                            <div className="text-slate-500">View transaction details</div>
                            <Link
                                to={`${config.explorerUrl}/tx/${receipt.transactionHash}`}
                                target="_blank"
                                className="text-primary"
                            >
                                <RiExternalLinkLine className="text-lg" />
                            </Link>
                        </div>
                    </div>
                ),
                error: <div>Transaction failed, please try again.</div>,
            },
            {
                success: {
                    duration: 6000,
                },
                position: 'bottom-right',
            },
        );

        await publicClient.waitForTransactionReceipt({ hash: txHash });
    };

    const fetchLicenses = async (): Promise<Array<License>> => {
        if (!publicClient || !address) {
            return [];
        }

        const [mndLicense, ndLicenses] = await Promise.all([
            publicClient
                .readContract({
                    address: config.mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'getUserLicense',
                    args: [address],
                })
                .then((userLicense) => {
                    const isLinked = userLicense.nodeAddress !== '0x0000000000000000000000000000000000000000';
                    const type = userLicense.licenseId === 1n ? ('GND' as const) : ('MND' as const);

                    if (!isLinked) {
                        return { ...userLicense, type, isLinked, isBanned: false as const };
                    }

                    let licenseDataPromise: Promise<{
                        node_alias: string;
                        node_is_online: boolean;
                        rewards_amount: bigint;
                    }>;

                    const licenseObj = {
                        ...userLicense,
                        type,
                        isLinked,
                        isBanned: false as const,
                    };

                    try {
                        licenseDataPromise = getLicenseRewardsAndNodeInfo({
                            ...userLicense,
                            type,
                            isLinked: false,
                            isBanned: false,
                        });
                    } catch (error) {
                        console.error(error);
                        toast.error('An error occurred while loading node data.');

                        return {
                            ...licenseObj,
                            rewards: Promise.resolve(0n),
                            alias: Promise.resolve(''),
                            isOnline: Promise.resolve(false),
                        };
                    }

                    return {
                        ...licenseObj,
                        rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                        alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                        isOnline: licenseDataPromise.then(({ node_is_online }) => node_is_online),
                    };
                }),
            publicClient
                .readContract({
                    address: config.ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'getLicenses',
                    args: [address],
                })
                .then((userLicenses) => {
                    return userLicenses.map((license) => {
                        const type = 'ND' as const;
                        const isLinked = license.nodeAddress !== '0x0000000000000000000000000000000000000000';
                        const totalAssignedAmount = config.ND_LICENSE_CAP;

                        if (!isLinked) {
                            return { ...license, type, totalAssignedAmount, isLinked };
                        }

                        let licenseDataPromise: Promise<{
                            node_alias: string;
                            node_is_online: boolean;
                            rewards_amount: bigint;
                        }>;

                        const licenseObj = {
                            ...license,
                            type,
                            totalAssignedAmount,
                            isLinked,
                        };

                        try {
                            licenseDataPromise = getLicenseRewardsAndNodeInfo({
                                ...license,
                                type,
                                totalAssignedAmount,
                                isLinked: false,
                            });
                        } catch (error) {
                            console.error(error);
                            toast.error('An error occurred while loading one of your licenses.');

                            return {
                                ...licenseObj,
                                rewards: Promise.resolve(0n),
                                alias: Promise.resolve(''),
                                isOnline: Promise.resolve(false),
                            };
                        }

                        return {
                            ...licenseObj,
                            rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                            alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                            isOnline: licenseDataPromise.then(({ node_is_online }) => node_is_online),
                        };
                    });
                }),
        ]);

        // const licenses = mndLicense.totalAssignedAmount ? [mndLicense, ...ndLicenses] : ndLicenses;

        // Leave here for testing purposes
        const licenses: Array<License> = [
            {
                alias: Promise.resolve('wen-lambo'),
                assignTimestamp: 1738934984n,
                claimableEpochs: 2n,
                isBanned: false,
                isLinked: true,
                isOnline: Promise.resolve(true),
                lastClaimEpoch: 1n,
                lastClaimOracle: '0x0000000000000000000000000000000000000000',
                licenseId: 2n,
                nodeAddress: '0x3bb330fe4BF4E5d45D901c40F9Eb9e3e68d6C744',
                remainingAmount: 15000000000000000000000n,
                rewards: Promise.resolve(0n),
                totalAssignedAmount: 15000000000000000000000n,
                totalClaimedAmount: 0n,
                type: 'MND',
            },
            {
                assignTimestamp: 1739273674n,
                claimableEpochs: 0n,
                isBanned: false,
                isLinked: false,
                lastClaimEpoch: 0n,
                lastClaimOracle: '0x0000000000000000000000000000000000000000',
                licenseId: 4519n,
                nodeAddress: '0x0000000000000000000000000000000000000000',
                remainingAmount: 50000000000000000000000n,
                totalAssignedAmount: 50000000000000000000000n,
                totalClaimedAmount: 0n,
                type: 'ND',
            },
            {
                alias: Promise.resolve('sm-nodex-1'),
                assignTimestamp: 1739273674n,
                claimableEpochs: 3n,
                isBanned: true,
                isLinked: true,
                isOnline: Promise.resolve(false),
                lastClaimEpoch: 2n,
                lastClaimOracle: '0x0000000000000000000000000000000000000000',
                licenseId: 5n,
                nodeAddress: '0x4cc330fe4BF4E5d45D901c40F9Eb9e3e68d6C855',
                remainingAmount: 450000000000000000000000n,
                rewards: Promise.resolve(57326500000000000000000n),
                totalAssignedAmount: 50000000000000000000000n,
                totalClaimedAmount: 5000000000000000000000n,
                type: 'ND',
            },
            {
                alias: Promise.resolve('noderunner_x8_macos'),
                assignTimestamp: 1738534500n,
                claimableEpochs: 2n,
                isBanned: false,
                isLinked: true,
                isOnline: Promise.resolve(true),
                lastClaimEpoch: 1n,
                lastClaimOracle: '0x0000000000000000000000000000000000000000',
                licenseId: 16n,
                nodeAddress: '0x5dd330fe4BF4E5d45D901c40F9Eb9e3e68d6C966',
                remainingAmount: 475000000000000000000000n,
                rewards: Promise.resolve(2512538672000000000000n),
                totalAssignedAmount: 500000000000000000000000n,
                totalClaimedAmount: 295562575342150000000000n,
                type: 'ND',
            },
            {
                assignTimestamp: 0n,
                claimableEpochs: 0n,
                isBanned: false,
                isLinked: false,
                lastClaimEpoch: 0n,
                lastClaimOracle: '0x0000000000000000000000000000000000000000',
                licenseId: 9999n,
                nodeAddress: '0x0000000000000000000000000000000000000000',
                remainingAmount: 4000000000000000000000n,
                totalAssignedAmount: 4000000000000000000000n,
                totalClaimedAmount: 0n,
                type: 'ND',
            },
        ];

        console.log('Licenses', licenses);

        return licenses;
    };

    const fetchR1Price = async () => {
        if (publicClient && config.liquidityManagerContractAddress.length === 42) {
            const price = await publicClient.readContract({
                address: config.liquidityManagerContractAddress,
                abi: LiquidityManagerAbi,
                functionName: 'getTokenPrice',
            });

            setR1Price(price);
        }
    };

    return (
        <BlockchainContext.Provider
            value={{
                watchTx,
                fetchLicenses,
                // R1 Balance
                r1Balance,
                setR1Balance,
                fetchR1Balance,
                // R1 Price
                r1Price,
                fetchR1Price,
            }}
        >
            {children}
        </BlockchainContext.Provider>
    );
};
