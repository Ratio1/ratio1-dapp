import Tiers from '@components/Tiers';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { environment, getCurrentEpoch, getNextEpochTimestamp } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import useAwait from '@lib/useAwait';
import { fBI } from '@lib/utils';
import { BigCard } from '@shared/BigCard';
import SyncingOraclesTag from '@shared/SyncingOraclesTag';
import { KycStatus } from '@typedefs/profile';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { RiArrowRightUpLine, RiTimeLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

function Dashboard() {
    const {
        licenses,
        fetchLicenses,
        r1Balance,
        currentPriceTier,
        priceTiers,
        isLoadingPriceTiers,
        fetchPriceTiers,
        onBuyDrawerOpen,
    } = useBlockchainContext() as BlockchainContextType;

    const { account, authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const { address } = useAccount();
    const publicClient = usePublicClient();

    const rewardsPromise: Promise<bigint | undefined> = useMemo(
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
    const [rewards, isLoadingRewards] = useAwait(rewardsPromise);

    // Init
    useEffect(() => {
        fetchPriceTiers();
    }, []);

    useEffect(() => {
        if (!publicClient) {
            return;
        }

        if (!address) {
            return;
        }

        if (authenticated) {
            fetchLicenses();
        }
    }, [authenticated]);

    const isBuyingDisabled = (): boolean =>
        !authenticated ||
        isLoadingPriceTiers ||
        !account ||
        (account.kycStatus !== KycStatus.Approved && environment === 'mainnet');

    const getKycNotCompletedAlert = () => (
        <>
            {!!authenticated && (
                <Alert
                    color="danger"
                    title="Buying licenses is available after completing KYC."
                    endContent={
                        <div className="ml-2">
                            <Button color="danger" size="sm" variant="solid" as={Link} to={routePath.profile}>
                                <div className="text-xs sm:text-sm">Go to KYC</div>
                            </Button>
                        </div>
                    }
                    classNames={{
                        title: 'text-xs sm:text-sm',
                        base: 'items-center py-2 px-3.5',
                    }}
                />
            )}
        </>
    );

    return (
        <>
            <div className="flex w-full flex-col gap-4 lg:gap-6">
                <div className="grid grid-cols-2 gap-4 lg:gap-6 larger:grid-cols-3">
                    <BigCard>
                        <div className="col h-full justify-between gap-2.5">
                            <div className="text-base font-semibold leading-6 lg:text-xl">Claimable $R1</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6 text-primary lg:text-[22px]">
                                    {isLoadingRewards ? (
                                        <div>...</div>
                                    ) : rewards === undefined ? (
                                        <SyncingOraclesTag />
                                    ) : (
                                        parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(2))
                                    )}
                                </div>
                            </div>
                        </div>
                    </BigCard>

                    <BigCard>
                        <div className="col h-full justify-between gap-2.5">
                            <div className="text-base font-semibold leading-6 lg:text-xl">$R1 Balance</div>

                            <div className="min-h-[28px]">
                                <div className="text-xl font-semibold leading-6 text-primary lg:text-[22px]">
                                    {r1Balance < 1000000000000000000000n
                                        ? parseFloat(Number(formatUnits(r1Balance ?? 0n, 18)).toFixed(2))
                                        : fBI(r1Balance, 18)}
                                </div>
                            </div>
                        </div>
                    </BigCard>

                    <BigCard>
                        <div className="col h-full justify-between gap-2.5">
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
                        </div>
                    </div>

                    {!!account && !isLoadingPriceTiers && isBuyingDisabled() && (
                        <div className="block larger:hidden">{getKycNotCompletedAlert()}</div>
                    )}

                    <div className="col gap-4 rounded-2xl border border-[#e3e4e8] bg-light p-6 lg:p-7">
                        <Tiers currentStage={currentPriceTier} stages={priceTiers} />
                    </div>
                </BigCard>
            </div>
        </>
    );
}

export default Dashboard;
