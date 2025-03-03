import Logo from '@assets/token_white.svg';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config, environment, getNextEpochTimestamp } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import useAwait from '@lib/useAwait';
import { fBI, fN } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/modal';
import { Tab, Tabs } from '@nextui-org/tabs';
import { DualTxsModal } from '@shared/DualTxsModal';
import { Timer } from '@shared/Timer';
import { KycStatus } from '@typedefs/profile';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowRightUpLine } from 'react-icons/ri';
import { ComputeParam, License } from 'typedefs/blockchain';
import { formatUnits } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

function LicensesPageHeader({
    onFilterChange,
    licenses,
    isLoading,
    setLoading,
}: {
    onFilterChange: (key: 'all' | 'linked' | 'unlinked') => void;
    licenses: Array<License>;
    isLoading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { watchTx, fetchLicenses, r1Price, fetchR1Price, fetchPriceTiers, isLoadingPriceTiers, onBuyDrawerOpen } =
        useBlockchainContext() as BlockchainContextType;
    const { authenticated, account } = useAuthenticationContext() as AuthenticationContextType;

    const [r1PriceUsd, setR1PriceUsd] = useState<number>();
    const [timestamp, setTimestamp] = useState<Date>(getNextEpochTimestamp());

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    // Data
    const rewardsPromise = useMemo(
        () =>
            Promise.all(licenses.filter((license) => license.isLinked).map((license) => license.rewards)).then((rewards) =>
                rewards.reduce((acc, reward) => acc + reward, 0n),
            ),
        [licenses],
    );
    const [rewards, isLoadingRewards] = useAwait(rewardsPromise);

    const earnedAmount = useMemo(() => licenses.reduce((acc, license) => acc + license.totalClaimedAmount, 0n), [licenses]);
    const futureClaimableR1Amount: bigint = useMemo(
        () => licenses.reduce((acc, license) => acc + license.remainingAmount, 0n),
        [licenses],
    );

    const futureClaimableUsd: number = useMemo(() => {
        if (!r1PriceUsd) return 0;
        return Number(formatUnits(futureClaimableR1Amount, 18)) * r1PriceUsd;
    }, [futureClaimableR1Amount, r1PriceUsd]);

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

    const claimAll = async () => {
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            setLoading(true);

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
                        args: [txParamsMND[0].computeParam, txParamsMND[0].eth_signatures],
                    });

                    await watchTx(txHashMND, publicClient);
                }
            };

            await Promise.all([claimND(), claimMND()]);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            onClose();
            setLoading(false);
            fetchLicenses(); // Refresh because only one tx might fail and the other one might work
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
                    if (!license.isLinked || (await license.rewards) === 0n) {
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
        (account.kycStatus !== KycStatus.Approved && environment === 'mainnet');

    const renderItem = (label: string, value) => (
        <div className="col gap-1">
            <div className="text-sm font-medium text-white/85">{label}</div>
            <div className="text-lg font-medium text-white lg:text-xl">{value}</div>
        </div>
    );

    return (
        <>
            <div className="relative w-full rounded-3xl">
                <div className="col relative z-10 h-full gap-4 rounded-3xl bg-[#436cc8] px-8 py-7 lg:gap-6">
                    <div className="flex flex-col justify-between gap-3.5 border-b-2 border-white/10 pb-4 layoutBreak:flex-row lg:pb-6">
                        <div className="row gap-2.5">
                            <img src={Logo} alt="Logo" className="h-7" />
                            <div className="text-lg font-medium text-white">Licenses</div>
                        </div>

                        <div className="row justify-between gap-2.5 layoutBreak:justify-end">
                            <Button
                                className="h-9"
                                color="primary"
                                size="sm"
                                variant="faded"
                                isLoading={isLoadingPriceTiers}
                                onPress={buyLicense}
                                isDisabled={isBuyingDisabled()}
                            >
                                <div className="row gap-1">
                                    <div className="text-sm">Buy License</div>
                                    <RiArrowRightUpLine className="text-base" />
                                </div>
                            </Button>

                            <Button
                                className="h-9"
                                color="primary"
                                size="sm"
                                variant="faded"
                                isLoading={isLoading}
                                onPress={claimAll}
                                isDisabled={!authenticated || !rewards}
                            >
                                <div className="text-sm">Claim rewards</div>
                            </Button>
                        </div>
                    </div>

                    <div className="col gap-8 lg:gap-10">
                        <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row lg:justify-between">
                            {renderItem(
                                'Claimable ($R1)',
                                isLoadingRewards ? '...' : parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(2)),
                            )}
                            {renderItem('Earned ($R1)', fBI(earnedAmount, 18))}
                            {renderItem('Future Claimable ($R1)', fBI(futureClaimableR1Amount, 18))}
                            {renderItem('Current Potential Value ($)', fN(futureClaimableUsd))}
                        </div>

                        <div className="flex flex-col-reverse justify-between gap-4 lg:flex-row lg:items-end lg:gap-0">
                            <div className="col gap-1.5">
                                <div className="text-base font-medium text-white lg:text-lg">Filter</div>

                                <Tabs
                                    aria-label="Tabs"
                                    color="default"
                                    radius="lg"
                                    size="lg"
                                    classNames={{
                                        tabList: 'p-1.5 bg-[#345eba]',
                                        tabContent: 'text-[15px] text-white',
                                    }}
                                    onSelectionChange={(key) => {
                                        onFilterChange(key as 'all' | 'linked' | 'unlinked');
                                    }}
                                >
                                    <Tab key="all" title={`All (${licenses.length})`} />
                                    <Tab
                                        key="linked"
                                        title={
                                            <div className="row gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                Linked ({licenses.filter((license) => license.isLinked).length})
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="unlinked"
                                        title={
                                            <div className="row gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                Unlinked ({licenses.filter((license) => !license.isLinked).length})
                                            </div>
                                        }
                                    />
                                </Tabs>
                            </div>

                            <div className="row gap-3">
                                <div className="text-sm font-medium text-white lg:text-base">Next rewards in</div>
                                <Timer
                                    timestamp={timestamp}
                                    callback={() => {
                                        setTimestamp(getNextEpochTimestamp());
                                        fetchLicenses();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-1 left-0 right-0 h-20 rounded-3xl bg-[#658bdc]"></div>
            </div>

            <DualTxsModal isOpen={isOpen} onOpenChange={onOpenChange} text="claim both ND and MND rewards" />
        </>
    );
}

export default LicensesPageHeader;
