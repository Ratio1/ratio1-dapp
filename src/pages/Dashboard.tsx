import Tiers from '@components/Tiers';
import { Button } from '@heroui/button';
import { environment, getCurrentEpoch, getDevAddress, getNextEpochTimestamp, isUsingDevAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import useAwait from '@lib/useAwait';
import { fBI } from '@lib/utils';
import { BigCard } from '@shared/BigCard';
import SyncingOraclesTag from '@shared/SyncingOraclesTag';
import { KycStatus } from '@typedefs/profile';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { RiArrowRightUpLine, RiErrorWarningLine, RiTimeLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

function Dashboard() {
    const {
        licenses,
        fetchLicenses,
        r1Balance,
        fetchR1Balance,
        currentPriceTier,
        priceTiers,
        isLoadingPriceTiers,
        fetchPriceTiers,
        onBuyDrawerOpen,
    } = useBlockchainContext() as BlockchainContextType;

    const { account, authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const publicClient = usePublicClient();

    const [isEpochTransitioning, setEpochTransitioning] = useState<boolean>(false);

    // Proof of Availability
    const rewardsPoAPromise: Promise<bigint | undefined> = useMemo(
        () =>
            Promise.all(licenses.filter((license) => license.isLinked).map((license) => license.rewards)).then(
                (rewardsArray) => {
                    const isError = rewardsArray.some((amount) => amount === undefined);

                    if (isError) {
                        setEpochTransitioning(true);
                        return undefined;
                    } else {
                        setEpochTransitioning(false);
                        return rewardsArray.reduce((acc, val) => (acc as bigint) + (val ?? 0n), 0n);
                    }
                },
            ),
        [licenses],
    );
    const [rewardsPoA, isLoadingRewardsPoA] = useAwait(rewardsPoAPromise);

    // Proof of AI
    const rewardsPoAI = useMemo(
        () => licenses.filter((license) => license.type === 'ND').reduce((acc, license) => acc + license.r1PoaiRewards, 0n),
        [licenses],
    );

    // Init
    useEffect(() => {
        fetchPriceTiers();
        fetchR1Balance();
    }, []);

    useEffect(() => {
        if (publicClient && address && authenticated) {
            fetchLicenses();
        }
    }, [publicClient, address, authenticated]);

    // Epoch transition
    useEffect(() => {
        if (!isLoadingRewardsPoA && isEpochTransitioning) {
            // Refresh licenses every minute to check if the epoch transition is over, which will also trigger a new rewards fetch
            setTimeout(() => {
                fetchLicenses();
            }, 60000);
        }
    }, [isLoadingRewardsPoA, isEpochTransitioning]);

    const isBuyingDisabled = (): boolean =>
        !authenticated ||
        isLoadingPriceTiers ||
        !account ||
        (account.kycStatus !== KycStatus.Approved && environment === 'mainnet');

    const getKycNotCompletedAlert = () => (
        <>
            {!!authenticated && (
                <div className="row justify-between gap-2 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                    <div className="row gap-1.5">
                        <RiErrorWarningLine className="hidden text-[20px] lg:block" />

                        <div className="md:font-medium">Buying licenses is available after completing KYC.</div>
                    </div>

                    <div className="flex">
                        <Button
                            className="bg-red-600"
                            color="danger"
                            size="sm"
                            variant="solid"
                            as={Link}
                            to={routePath.profile}
                        >
                            <div className="text-sm">Go to KYC</div>
                        </Button>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <>
            <div className="flex w-full flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 larger:grid-cols-3">
                    <BigCard>
                        <div className="col h-full justify-between gap-1.5">
                            <div className="text-base font-semibold leading-6 lg:text-lg">Claimable $R1</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6 text-primary">
                                    {isLoadingRewardsPoA ? (
                                        <div>...</div>
                                    ) : rewardsPoA === undefined ? (
                                        <SyncingOraclesTag />
                                    ) : (
                                        parseFloat(Number(formatUnits((rewardsPoA ?? 0n) + (rewardsPoAI ?? 0n), 18)).toFixed(2))
                                    )}
                                </div>
                            </div>
                        </div>
                    </BigCard>

                    <BigCard>
                        <div className="col h-full justify-between gap-1.5">
                            <div className="text-base font-semibold leading-6 lg:text-lg">$R1 Balance</div>

                            <div className="min-h-[28px]">
                                <div className="text-xl font-semibold leading-6 text-primary">
                                    {r1Balance < 1000000000000000000000n
                                        ? parseFloat(Number(formatUnits(r1Balance ?? 0n, 18)).toFixed(2))
                                        : fBI(r1Balance, 18)}
                                </div>
                            </div>
                        </div>
                    </BigCard>

                    <BigCard>
                        <div className="col h-full justify-between gap-1.5">
                            <div className="text-base font-semibold leading-6 lg:text-lg">Current Epoch</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6">{getCurrentEpoch()}</div>

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
                        <div className="text-xl font-bold lg:text-[22px]">Licenses & Tiers</div>

                        <Button color="primary" onPress={onBuyDrawerOpen} isDisabled={isBuyingDisabled()}>
                            <div className="row gap-1.5">
                                <div className="text-sm font-medium lg:text-base">Buy License</div>
                                <RiArrowRightUpLine className="text-[18px]" />
                            </div>
                        </Button>

                        {/* <div className="row gap-3">
                            {!!account && authenticated && !isLoadingPriceTiers && isBuyingDisabled() && (
                                <div className="hidden larger:block">{getKycNotCompletedAlert()}</div>
                            )}

                            <div className="flex">
                                <Button color="primary" onPress={onBuyDrawerOpen} isDisabled={isBuyingDisabled()}>
                                    <div className="row gap-1.5">
                                        <div className="text-sm font-medium lg:text-base">Buy License</div>
                                        <RiArrowRightUpLine className="text-[18px]" />
                                    </div>
                                </Button>
                            </div>
                        </div> */}
                    </div>

                    {!!account && !isLoadingPriceTiers && isBuyingDisabled() && <>{getKycNotCompletedAlert()}</>}

                    <div className="col gap-4 rounded-2xl border border-[#e3e4e8] bg-light p-5">
                        <Tiers currentStage={currentPriceTier} stages={priceTiers} />
                    </div>
                </BigCard>
            </div>
        </>
    );
}

export default Dashboard;
