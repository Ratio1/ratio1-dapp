import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { PoAIContractAbi } from '@blockchain/PoAIContract';
import { Button } from '@heroui/button';
import { useDisclosure } from '@heroui/modal';
import { config, environment, getNextEpochTimestamp } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import useAwait from '@lib/useAwait';
import { fBI, fN, getValueWithLabel } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import CustomTabs from '@shared/CustomTabs';
import { DualTxsModal } from '@shared/DualTxsModal';
import { SmallTag } from '@shared/SmallTag';
import { Timer } from '@shared/Timer';
import { ApplicationStatus } from '@typedefs/profile';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowRightUpLine, RiLink, RiLinkUnlink, RiTimeLine } from 'react-icons/ri';
import { ComputeParam, License } from 'typedefs/blockchain';
import { formatUnits } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

function LicensesPageHeader({
    onFilterChange,
    onBulkLink,
    licenses,
    unlinkedNdCount,
    isClaimingAllRewardsPoA,
    setClaimingAllRewardsPoA,
    isClaimingAllRewardsPoAI,
    setClaimingAllRewardsPoAI,
}: {
    onFilterChange: (key: 'all' | 'linked' | 'unlinked') => void;
    onBulkLink: () => void;
    licenses: Array<License>;
    unlinkedNdCount: number;
    isClaimingAllRewardsPoA: boolean;
    setClaimingAllRewardsPoA: React.Dispatch<React.SetStateAction<boolean>>;
    isClaimingAllRewardsPoAI: boolean;
    setClaimingAllRewardsPoAI: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { watchTx, fetchLicenses, r1Price, fetchR1Price, fetchPriceTiers, isLoadingPriceTiers, onBuyDrawerOpen } =
        useBlockchainContext() as BlockchainContextType;
    const { authenticated, account } = useAuthenticationContext() as AuthenticationContextType;

    const [r1PriceUsd, setR1PriceUsd] = useState<number>();
    const [timestamp, setTimestamp] = useState<Date>(getNextEpochTimestamp());

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    // Proof of Availability
    const rewardsPoAPromise: Promise<bigint | undefined> = useMemo(
        () =>
            Promise.all(licenses.filter((license) => license.isLinked).map((license) => license.rewards)).then(
                (rewardsArray) => {
                    const isError = rewardsArray.some((amount) => amount === undefined);

                    if (isError) {
                        return undefined;
                    } else {
                        return rewardsArray.reduce((acc, val) => (acc as bigint) + (val ?? 0n), 0n);
                    }
                },
            ),
        [licenses],
    );
    const [rewardsPoA, isLoadingRewardsPoA] = useAwait(rewardsPoAPromise);

    const earnedAmountPoA = useMemo(() => licenses.reduce((acc, license) => acc + license.totalClaimedAmount, 0n), [licenses]);
    const futureClaimableR1AmountPoA: bigint = useMemo(
        () => licenses.reduce((acc, license) => acc + license.remainingAmount, 0n),
        [licenses],
    );

    const futureClaimableUsdPoA: number = useMemo(() => {
        if (!r1PriceUsd) return 0;
        return Number(formatUnits(futureClaimableR1AmountPoA, 18)) * r1PriceUsd;
    }, [futureClaimableR1AmountPoA, r1PriceUsd]);

    // Proof of AI
    const rewardsPoAI = useMemo(
        () => licenses.filter((license) => license.type === 'ND').reduce((acc, license) => acc + license.r1PoaiRewards, 0n),
        [licenses],
    );

    // Init
    useEffect(() => {
        fetchR1Price();
    }, []);

    useEffect(() => {
        if (r1Price) {
            const divisor = 10n ** BigInt(18);
            const scale = 1000000n;
            setR1PriceUsd(Number((r1Price * scale) / divisor) / Number(scale));
        }
    }, [r1Price]);

    const claimAllRewardsPoA = async () => {
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            setClaimingAllRewardsPoA(true);

            const txParamsND = await getClaimTxParams('ND');
            const txParamsMND = await getClaimTxParams('MND');

            if (!txParamsND.length && !txParamsMND.length) {
                toast.error('No rewards to claim at the moment.');
                throw new Error('No rewards to claim at the moment.');
            }

            if (txParamsND.length && txParamsMND.length) {
                onOpen();
            }

            const claimND = async () => {
                if (txParamsND.length) {
                    const txHashND = await walletClient.writeContract({
                        address: config.ndContractAddress,
                        abi: NDContractAbi,
                        functionName: 'claimRewards',
                        args: [
                            [...txParamsND.map(({ computeParam }) => computeParam)],
                            [...txParamsND.map(({ eth_signatures }) => eth_signatures)],
                        ],
                    });

                    await watchTx(txHashND, publicClient);
                }
            };

            const claimMND = async () => {
                if (txParamsMND.length) {
                    const txHashMND = await walletClient.writeContract({
                        address: config.mndContractAddress,
                        abi: MNDContractAbi,
                        functionName: 'claimRewards',
                        args: [
                            [...txParamsMND.map(({ computeParam }) => computeParam)],
                            [...txParamsMND.map(({ eth_signatures }) => eth_signatures)],
                        ],
                    });

                    await watchTx(txHashMND, publicClient);
                }
            };

            await Promise.all([claimND(), claimMND()]);
        } catch (err: any) {
            console.error(err.message);
            toast.error('An error occurred, please try again.');
        } finally {
            onClose();
            setClaimingAllRewardsPoA(false);
            // Using a timeout here to make sure fetchLicenses returns the updated smart contract data
            setTimeout(() => {
                fetchLicenses();
            }, 250);
        }
    };

    const claimAllRewardsPoAI = async () => {
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            setClaimingAllRewardsPoAI(true);

            const licensesWithPoaiRewards = licenses.filter((license) => license.type === 'ND' && license.r1PoaiRewards > 0n);
            if (licensesWithPoaiRewards.length === 0) {
                toast.error('No rewards to claim at the moment.');
                throw new Error('No rewards to claim at the moment.');
            }

            const txHash = await walletClient.writeContract({
                address: config.poaiManagerContractAddress,
                abi: PoAIContractAbi,
                functionName: 'claimRewardsForNodes',
                args: [licensesWithPoaiRewards.map((license) => license.nodeAddress)],
            });
            await watchTx(txHash, publicClient);
        } catch (err: any) {
            console.error(err.message);
            toast.error('An error occurred, please try again.');
        } finally {
            onClose();
            setClaimingAllRewardsPoAI(false);
            // Using a timeout here to make sure fetchLicenses returns the updated smart contract data
            setTimeout(() => {
                fetchLicenses();
            }, 250);
        }
    };

    const buyLicense = async () => {
        await fetchPriceTiers();
        onBuyDrawerOpen();
    };

    const getClaimTxParams = async (
        type: License['type'],
    ): Promise<
        {
            computeParam: ComputeParam;
            eth_signatures: `0x${string}`[];
        }[]
    > =>
        await Promise.all(
            licenses
                .filter((license) => license.type === type)
                .map(async (license) => {
                    if (!license.isLinked || !(await license.rewards)) {
                        return;
                    }
                    const [epochs, availabilies, eth_signatures] = await Promise.all([
                        license.epochs,
                        license.epochsAvailabilities,
                        license.ethSignatures,
                    ]);
                    const computeParam = {
                        licenseId: license.licenseId,
                        nodeAddress: license.nodeAddress,
                        epochs: epochs.map((epoch) => BigInt(epoch)),
                        availabilies,
                    };
                    return { computeParam, eth_signatures };
                }),
        ).then((a) => a.filter((x): x is { computeParam: ComputeParam; eth_signatures: `0x${string}`[] } => !!x));

    const isBuyingDisabled = (): boolean =>
        !authenticated ||
        isLoadingPriceTiers ||
        !account ||
        (account.kycStatus !== ApplicationStatus.Approved && environment === 'mainnet');

    const isBulkLinkDisabled = (): boolean =>
        !authenticated ||
        !account ||
        unlinkedNdCount === 0 ||
        (account.kycStatus !== ApplicationStatus.Approved && environment === 'mainnet');

    const getSectionTitle = (title: string, variant: 'ND' | 'MND' = 'ND') => <SmallTag variant={variant}>{title}</SmallTag>;

    return (
        <>
            <div className="col gap-4">
                <BorderedCard
                    footer={
                        <div className="flex justify-end bg-slate-50 px-3.5 py-2.5">
                            <div className="row gap-[5px]">
                                <RiTimeLine className="text-lg text-slate-500" />

                                <div className="text-sm font-medium text-slate-500">Next rewards in</div>

                                <Timer
                                    variant="compact"
                                    timestamp={timestamp}
                                    callback={() => {
                                        setTimestamp(getNextEpochTimestamp());
                                        fetchLicenses();
                                    }}
                                />
                            </div>
                        </div>
                    }
                    isRoundedDouble
                    disableWrapper
                >
                    <div className="col gap-6 p-4 sm:gap-4">
                        {/* Top row */}
                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="row flex-1 justify-between">
                                <div className="text-xl font-semibold">Rewards</div>

                                <Button
                                    className="h-9"
                                    color="primary"
                                    size="sm"
                                    variant="solid"
                                    isLoading={isLoadingPriceTiers}
                                    onPress={buyLicense}
                                    isDisabled={isBuyingDisabled()}
                                >
                                    <div className="row gap-1">
                                        <div className="text-sm">Buy License</div>
                                        <RiArrowRightUpLine className="text-base" />
                                    </div>
                                </Button>
                            </div>

                            <div className="row justify-between gap-2.5 md:justify-end">
                                <Button
                                    className="h-9 border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                    isLoading={isClaimingAllRewardsPoA}
                                    onPress={claimAllRewardsPoA}
                                    isDisabled={!authenticated || !rewardsPoA}
                                >
                                    <div className="text-sm">Claim rewards (PoA)</div>
                                </Button>

                                <Button
                                    className="h-9 border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                    isLoading={isClaimingAllRewardsPoAI}
                                    onPress={claimAllRewardsPoAI}
                                    isDisabled={!authenticated || !rewardsPoAI}
                                >
                                    <div className="text-sm">Claim rewards (PoAI)</div>
                                </Button>
                            </div>
                        </div>

                        {/* PoA and PoAI */}
                        <div className="col gap-6 xl:gap-8">
                            <div className="col gap-2">
                                <div className="row w-full gap-3">
                                    {getSectionTitle('Proof of Availability', 'ND')}

                                    <div className="w-full border-b-2 border-slate-100"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row lg:justify-between">
                                    {getValueWithLabel(
                                        'Claimable ($R1)',
                                        isLoadingRewardsPoA || rewardsPoA === undefined
                                            ? '...'
                                            : parseFloat(Number(formatUnits(rewardsPoA ?? 0n, 18)).toFixed(2)),
                                        'text-primary',
                                    )}

                                    {getValueWithLabel(
                                        'Earned ($R1)',
                                        earnedAmountPoA < 1000000000000000000000n
                                            ? parseFloat(Number(formatUnits(earnedAmountPoA ?? 0n, 18)).toFixed(2))
                                            : fBI(earnedAmountPoA, 18),
                                    )}

                                    {getValueWithLabel('Future Claimable ($R1)', fBI(futureClaimableR1AmountPoA, 18))}

                                    {getValueWithLabel('Current Potential Value ($)', fN(futureClaimableUsdPoA))}
                                </div>
                            </div>

                            <div className="col gap-2">
                                <div className="row w-full gap-3">
                                    {getSectionTitle('Proof of AI', 'MND')}

                                    <div className="w-full border-b-2 border-slate-100"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row lg:justify-between">
                                    {getValueWithLabel(
                                        'Claimable ($R1)',
                                        parseFloat(Number(formatUnits(rewardsPoAI ?? 0n, 18)).toFixed(2)),
                                        'text-purple-600',
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </BorderedCard>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="center-all md:justify-start">
                        <CustomTabs
                            tabs={[
                                {
                                    key: 'all',
                                    title: 'All',
                                    icon: <></>,
                                    count: licenses.length,
                                },
                                {
                                    key: 'linked',
                                    title: 'Linked',
                                    icon: <RiLink />,
                                    count: licenses.filter((license) => license.isLinked).length,
                                },
                                {
                                    key: 'unlinked',
                                    title: 'Unlinked',
                                    icon: <RiLinkUnlink />,
                                    count: licenses.filter((license) => !license.isLinked).length,
                                },
                            ]}
                            onSelectionChange={(key) => {
                                onFilterChange(key as 'all' | 'linked' | 'unlinked');
                            }}
                        />
                    </div>

                    <div className="flex justify-center md:justify-end">
                        <Button
                            className="h-9 border-2 border-slate-200 bg-white"
                            color="primary"
                            size="sm"
                            variant="flat"
                            onPress={onBulkLink}
                            isDisabled={isBulkLinkDisabled()}
                        >
                            <div className="row gap-1.5">
                                <RiLink className="text-base" />
                                <div className="text-sm">Bulk Link Nodes</div>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            <DualTxsModal isOpen={isOpen} onOpenChange={onOpenChange} text="claim both ND and MND rewards" />
        </>
    );
}

export default LicensesPageHeader;
