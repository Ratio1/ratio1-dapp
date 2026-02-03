import { ERC20Abi } from '@blockchain/ERC20';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { useDisclosure } from '@heroui/modal';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { BaseGNDLicense, BaseMNDLicense, BaseNDLicense, getLicensesWithNodesAndRewards } from '@lib/licenses';
import { INITIAL_TIERS_STATE, isZeroAddress } from '@lib/utils';
import { partition } from 'lodash';
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

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
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
        return fetchErc20Balance(config.r1ContractAddress).then(setR1Balance);
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
            const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 2,
            });

            if (receipt.status === 'success') {
                return receipt;
            } else {
                throw new Error('Transaction failed, please try again.');
            }
        };

        // Use the promise from waitForTx for both the toast and the return value
        const txPromise = waitForTx();

        toast.promise(
            txPromise,
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
                                <Link to={`${config.explorerUrl}/tx/${txHash}`} target="_blank" className="text-primary">
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

        // Return the same promise that the toast is watching
        return txPromise;
    };

    const fetchLicenses = async (useSilentUpdate: boolean = false): Promise<License[]> => {
        if (!publicClient || !address) {
            console.error('No public client or address.');
            return [];
        }

        if (!useSilentUpdate) {
            setLoadingLicenses(true);
        }

        let licenses: License[] = [];

        console.log('Fetching licenses...');

        try {
            const [mndLicenses, ndLicenses] = await Promise.all([
                publicClient
                    .readContract({
                        address: config.mndContractAddress,
                        abi: MNDContractAbi,
                        functionName: 'getLicenses',
                        args: [address],
                    })
                    .then(async (licenses) =>
                        Promise.all(
                            licenses.map(async (license) => {
                                const type: 'GND' | 'MND' = license.licenseId === 1n ? ('GND' as const) : ('MND' as const);
                                const isBanned = false as const;
                                //TODO should be improved to fetch in a single call
                                const awbBalance = await publicClient.readContract({
                                    address: config.mndContractAddress,
                                    abi: MNDContractAbi,
                                    functionName: 'awbBalances',
                                    args: [license.licenseId],
                                });

                                const baseGndOrMndLicense: BaseGNDLicense | BaseMNDLicense = {
                                    ...license,
                                    type,
                                    isBanned,
                                    awbBalance,
                                };

                                return baseGndOrMndLicense;
                            }),
                        ),
                    ),
                publicClient
                    .readContract({
                        address: config.ndContractAddress,
                        abi: NDContractAbi,
                        functionName: 'getLicenses',
                        args: [address],
                    })
                    .then((licenses) =>
                        licenses.map((license) => {
                            const type = 'ND' as const;
                            const totalAssignedAmount = config.ND_LICENSE_CAP;

                            const baseNdLicense: BaseNDLicense = {
                                ...license,
                                type,
                                totalAssignedAmount,
                            };

                            return baseNdLicense;
                        }),
                    ),
            ]);

            const baseLicenses: (BaseGNDLicense | BaseMNDLicense | BaseNDLicense)[] = [...mndLicenses, ...ndLicenses];

            const [linked, notLinked] = partition(baseLicenses, (license) => !isZeroAddress(license.nodeAddress));

            const licensesWithNodesAndRewards = getLicensesWithNodesAndRewards(linked, publicClient);

            licenses = [
                ...notLinked.map((license) => ({
                    ...license,
                    isLinked: false as const,
                })),
                ...licensesWithNodesAndRewards,
            ];

            console.log('Fetched licenses', licenses);
            setLicenses(licenses);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while fetching licenses.');
        } finally {
            setLoadingLicenses(false);
        }

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
