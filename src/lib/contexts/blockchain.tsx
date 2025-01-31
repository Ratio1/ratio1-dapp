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
import {
    explorerUrl,
    liquidityManagerContractAddress,
    mndContractAddress,
    ND_LICENSE_CAP,
    ndContractAddress,
    r1ContractAddress,
} from '../config';
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
                    address: r1ContractAddress,
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
                            <Link to={`${explorerUrl}/tx/${receipt.transactionHash}`} target="_blank" className="text-primary">
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
                    address: mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'getUserLicense',
                    args: [address],
                })
                .then((userLicense) => {
                    const isLinked = userLicense.nodeAddress !== '0x0000000000000000000000000000000000000000';
                    const type = userLicense.licenseId === 0n ? ('GND' as const) : ('MND' as const);

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
                    address: ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'getLicenses',
                    args: [address],
                })
                .then((userLicenses) => {
                    return userLicenses.map((license) => {
                        const type = 'ND' as const;
                        const isLinked = license.nodeAddress !== '0x0000000000000000000000000000000000000000';
                        const totalAssignedAmount = ND_LICENSE_CAP;

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

        if (mndLicense.totalAssignedAmount) {
            return [mndLicense, ...ndLicenses];
        }

        return ndLicenses;
    };

    const fetchR1Price = async () => {
        if (publicClient) {
            const price = await publicClient.readContract({
                address: liquidityManagerContractAddress,
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
