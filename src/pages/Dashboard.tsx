import { NDContractAbi } from '@blockchain/NDContract';
import Buy from '@components/Buy';
import Tiers from '@components/Tiers';
import { config, getCurrentEpoch, getNextEpochTimestamp } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes';
import useAwait from '@lib/useAwait';
import { useDisclosure } from '@lib/useDisclosure';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Drawer, DrawerBody, DrawerContent } from '@nextui-org/drawer';
import { BigCard } from '@shared/BigCard';
import { KycStatus } from '@typedefs/profile';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { RiArrowRightUpLine, RiTimeLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { License, Stage } from 'typedefs/blockchain';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

const INITIAL_STAGES_STATE: Stage[] = [
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

function Dashboard() {
    const { fetchLicenses, r1Balance } = useBlockchainContext() as BlockchainContextType;
    const { account, authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const [isLoading, setLoading] = useState<boolean>(true);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [licenses, setLicenses] = useState<Array<License>>([]);

    const { address } = useAccount();
    const publicClient = usePublicClient();

    const rewardsPromise = useMemo(
        () =>
            Promise.all(licenses.filter((license) => license.isLinked).map((license) => license.rewards)).then((rewards) =>
                rewards.reduce((acc, reward) => acc + reward, 0n),
            ),
        [licenses],
    );
    const [rewards, isLoadingRewards] = useAwait(rewardsPromise);

    const [currentStage, setCurrentStage] = useState<number>(1);
    const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES_STATE);

    // Init
    useEffect(() => {
        if (!publicClient) {
            return;
        }

        setLoading(true);

        Promise.all([
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
        ]).then(([currentPriceTier, priceTiers]) => {
            setCurrentStage(currentPriceTier);

            setStages(
                priceTiers.map((tier, index) => ({
                    index: index + 1,
                    usdPrice: Number(tier.usdPrice),
                    totalUnits: Number(tier.totalUnits),
                    soldUnits: Number(tier.soldUnits),
                })),
            );

            setLoading(false);
        });
    }, [publicClient]);

    useEffect(() => {
        if (!publicClient) {
            return;
        }
        if (!address) {
            return;
        }

        if (authenticated) {
            fetchLicenses().then(setLicenses);
        }
    }, [authenticated]);

    const isKycNotCompleted = !account || account.kycStatus !== KycStatus.Completed;

    // TODO: Production: add isKycNotCompleted
    const isBuyingDisabled = (): boolean => isLoading;

    const getKycNotCompletedAlert = () => (
        <Alert
            color="danger"
            title="Buying licenses is available after completing KYC."
            endContent={
                <div className="ml-2">
                    <Link to={routePath.profileKyc}>
                        <Button color="danger" size="sm" variant="solid">
                            <div className="text-xs sm:text-sm">Go to KYC</div>
                        </Button>
                    </Link>
                </div>
            }
            classNames={{
                title: 'text-xs sm:text-sm',
                base: 'items-center py-2 px-3.5',
            }}
        />
    );

    return (
        <>
            <div className="flex w-full flex-col gap-4 lg:gap-6">
                <div className="grid grid-cols-2 gap-4 lg:gap-6 larger:grid-cols-3">
                    <BigCard>
                        <div className="col h-full justify-between gap-2">
                            <div className="text-base font-semibold leading-6 lg:text-xl">Claimable $R1</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6 text-primary lg:text-[22px]">
                                    {isLoadingRewards ? '...' : parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(2))}
                                </div>
                            </div>
                        </div>
                    </BigCard>

                    <BigCard>
                        <div className="col h-full justify-between gap-2">
                            <div className="text-base font-semibold leading-6 lg:text-xl">$R1 Balance</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6 text-primary lg:text-[22px]">
                                    {parseFloat(Number(formatUnits(r1Balance, 18)).toFixed(3))}
                                </div>
                            </div>
                        </div>
                    </BigCard>

                    <BigCard>
                        <div className="col h-full justify-between gap-2">
                            <div className="text-base font-semibold leading-6 lg:text-xl">Current Epoch</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6 lg:text-[22px]">{getCurrentEpoch()}</div>

                                <div className="web-only-block rounded-md bg-orange-100 px-2 py-1 text-sm font-medium tracking-wider text-orange-600">
                                    <div className="row gap-1">
                                        <div className="text-[18px]">
                                            <RiTimeLine />
                                        </div>
                                        <div>{formatDistanceToNow(getNextEpochTimestamp())}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </BigCard>
                </div>

                <BigCard fullWidth>
                    <div className="row justify-between gap-3">
                        <div className="text-xl font-bold leading-7 lg:text-[26px]">Licenses & Tiers</div>

                        <div className="row gap-3">
                            <div className="hidden larger:block">{getKycNotCompletedAlert()}</div>

                            <div className="flex">
                                <Button color="primary" onPress={onOpen} isDisabled={isBuyingDisabled()}>
                                    <div className="row gap-1.5">
                                        <div className="text-sm font-medium lg:text-base">Buy License</div>
                                        <RiArrowRightUpLine className="text-[18px]" />
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="block larger:hidden">{getKycNotCompletedAlert()}</div>

                    <div className="col gap-4 rounded-2xl border border-[#e3e4e8] bg-light p-6 lg:p-7">
                        <Tiers currentStage={currentStage} stages={stages} />
                    </div>
                </BigCard>
            </div>

            <Drawer
                isOpen={isOpen}
                onOpenChange={onClose}
                size="sm"
                classNames={{
                    base: 'data-[placement=right]:sm:m-3 data-[placement=left]:sm:m-3 rounded-none sm:rounded-medium font-mona',
                }}
                motionProps={{
                    variants: {
                        enter: {
                            opacity: 1,
                            x: 0,
                        },
                        exit: {
                            x: 100,
                            opacity: 0,
                        },
                    },
                }}
                hideCloseButton
            >
                <DrawerContent>
                    <DrawerBody>
                        <Buy onClose={onClose} currentStage={currentStage} stage={stages[currentStage - 1]} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default Dashboard;
