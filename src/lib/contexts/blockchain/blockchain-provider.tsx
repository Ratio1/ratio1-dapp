import { ERC20Abi } from '@blockchain/ERC20';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config } from '@lib/config';
import { INITIAL_TIERS_STATE, getNodeAndLicenseRewards } from '@lib/utils';
import { useDisclosure } from "@heroui/modal";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiExternalLinkLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { EthAddress, License, PriceTier } from 'typedefs/blockchain';
import { TransactionReceipt } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { BlockchainContext } from './context';

export const BlockchainProvider = ({ children }) => {
    // Licenses
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoadingLicenses, setLoadingLicenses] = useState<boolean>(false);

    // R1 Balance
    const [r1Balance, setR1Balance] = useState<bigint>(0n);
    // R1 Price
    const [r1Price, setR1Price] = useState<bigint>(0n);

    // Price tiers
    const [currentPriceTier, setCurrentPriceTier] = useState<number>(2);
    const [priceTiers, setPriceTiers] = useState<PriceTier[]>(INITIAL_TIERS_STATE);
    const [isLoadingPriceTiers, setLoadingPriceTiers] = useState<boolean>(false);

    // License buying
    const { isOpen: isBuyDrawerOpen, onOpen: onBuyDrawerOpen, onClose: onBuyDrawerClose } = useDisclosure();

    const { address } = useAccount();
    const publicClient = usePublicClient();

    useEffect(() => {
        if (publicClient && address) {
            fetchR1Balance();
        }
    }, [address, publicClient]);

    const fetchPriceTiers = async () => {
        if (!publicClient) return;

        setLoadingPriceTiers(true);

        try {
            const [currentPriceTier, priceTiers] = await Promise.all([
                publicClient.readContract({
                    address: config.ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'currentPriceTier',
                }),
                publicClient.readContract({
                    address: config.ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'getPriceTiers',
                }),
            ]);

            setCurrentPriceTier(currentPriceTier);

            setPriceTiers(
                priceTiers.map((tier, index) => ({
                    index: index + 1,
                    usdPrice: Number(tier.usdPrice),
                    totalUnits: Number(tier.totalUnits),
                    soldUnits: Number(tier.soldUnits),
                })),
            );
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while loading licenses price tiers.');
        } finally {
            setLoadingPriceTiers(false);
        }
    };

    const fetchR1Balance = () => {
        fetchErc20Balance(config.r1ContractAddress).then(setR1Balance);
    };

    const fetchErc20Balance = (tokenAddress: EthAddress) => {
        if (publicClient && address) {
            return publicClient.readContract({
                address: tokenAddress,
                abi: ERC20Abi,
                functionName: 'balanceOf',
                args: [address],
            });
        } else {
            return Promise.resolve(0n);
        }
    };

    const watchTx = async (txHash: string, publicClient): Promise<TransactionReceipt> => {
        const waitForTx = async (): Promise<TransactionReceipt> => {
            const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            if (receipt.status === 'success') {
                return receipt;
            } else {
                throw new Error(receipt.transactionHash);
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
                error: () => {
                    return (
                        <div className="col">
                            <div className="font-medium text-red-600">Transaction failed</div>
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
                    );
                },
            },
            {
                success: {
                    duration: 6000,
                },
                position: 'bottom-right',
            },
        );

        const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        if (receipt.status === 'success') {
            return receipt;
        } else {
            throw new Error('Transaction failed, please try again.');
        }
    };

    const fetchLicenses = async (): Promise<Array<License>> => {
        if (!publicClient || !address) {
            return [];
        }

        setLoadingLicenses(true);

        const [mndLicenses, ndLicenses] = await Promise.all([
            publicClient
                .readContract({
                    address: config.mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'getLicenses',
                    args: [address],
                })
                .then((userLicenses) => {
                    return userLicenses.map((userLicense) => {
                        const isLinked = userLicense.nodeAddress !== '0x0000000000000000000000000000000000000000';
                        const type = userLicense.licenseId === 1n ? ('GND' as const) : ('MND' as const);

                        if (!isLinked) {
                            return { ...userLicense, type, isLinked, isBanned: false as const };
                        }

                        const nodeAndLicenseRewardsPromise: Promise<{
                            rewards_amount: bigint | undefined;
                            epochs: number[];
                            epochs_vals: number[];
                            eth_signatures: EthAddress[];
                            node_alias?: string;
                            node_is_online: boolean;
                        }> = getNodeAndLicenseRewards({
                            ...userLicense,
                            type,
                            isLinked: false,
                            isBanned: false,
                        });

                        return {
                            ...userLicense,
                            type,
                            isLinked,
                            isBanned: false as const,
                            rewards: nodeAndLicenseRewardsPromise.then(({ rewards_amount }) => rewards_amount),
                            alias: nodeAndLicenseRewardsPromise.then(({ node_alias }) => node_alias),
                            isOnline: nodeAndLicenseRewardsPromise.then(({ node_is_online }) => node_is_online),
                            epochs: nodeAndLicenseRewardsPromise.then(({ epochs }) => epochs),
                            epochsAvailabilities: nodeAndLicenseRewardsPromise.then(({ epochs_vals }) => epochs_vals),
                            ethSignatures: nodeAndLicenseRewardsPromise.then(({ eth_signatures }) => eth_signatures),
                        };
                    });
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

                        const nodeAndLicenseRewardsPromise: Promise<{
                            rewards_amount: bigint | undefined;
                            epochs: number[];
                            epochs_vals: number[];
                            eth_signatures: EthAddress[];
                            node_alias?: string;
                            node_is_online: boolean;
                        }> = getNodeAndLicenseRewards({
                            ...license,
                            type,
                            totalAssignedAmount,
                            isLinked: false,
                        });

                        return {
                            ...license,
                            type,
                            totalAssignedAmount,
                            isLinked,
                            rewards: nodeAndLicenseRewardsPromise.then(({ rewards_amount }) => rewards_amount),
                            alias: nodeAndLicenseRewardsPromise.then(({ node_alias }) => node_alias),
                            isOnline: nodeAndLicenseRewardsPromise.then(({ node_is_online }) => node_is_online),
                            epochs: nodeAndLicenseRewardsPromise.then(({ epochs }) => epochs),
                            epochsAvailabilities: nodeAndLicenseRewardsPromise.then(({ epochs_vals }) => epochs_vals),
                            ethSignatures: nodeAndLicenseRewardsPromise.then(({ eth_signatures }) => eth_signatures),
                        };
                    });
                }),
        ]);

        const licenses = [...mndLicenses, ...ndLicenses];
        console.log('Licenses', licenses);
        setLicenses(licenses);
        setLoadingLicenses(false);

        return licenses;
    };

    const fetchR1Price = async () => {
        if (publicClient) {
            const price = await publicClient.readContract({
                address: config.ndContractAddress,
                abi: NDContractAbi,
                functionName: 'getTokenPrice',
            });

            setR1Price(price);
        }
    };

    return (
        <BlockchainContext.Provider
            value={{
                watchTx,
                // Licenses
                licenses,
                isLoadingLicenses,
                fetchLicenses,
                setLicenses,
                // R1 Balance
                r1Balance,
                setR1Balance,
                fetchR1Balance,
                // R1 Price
                r1Price,
                fetchR1Price,
                // Price tiers
                currentPriceTier,
                priceTiers,
                isLoadingPriceTiers,
                fetchPriceTiers,
                // License buying
                isBuyDrawerOpen,
                onBuyDrawerOpen,
                onBuyDrawerClose,
                // Generic blockchain functions
                fetchErc20Balance,
            }}
        >
            {children}
        </BlockchainContext.Provider>
    );
};
