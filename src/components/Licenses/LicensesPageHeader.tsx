import Logo from '@assets/token_white.svg';
import { NDContractAbi } from '@blockchain/NDContract';
import { getNodeEpochsRange } from '@lib/api/oracles';
import { getNextEpochTimestamp, ndContractAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import useAwait from '@lib/useAwait';
import { fBI, getCurrentEpoch } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Tab, Tabs } from '@nextui-org/tabs';
import { Timer } from '@shared/Timer';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ComputeParam, License } from 'typedefs/blockchain';
import { formatUnits } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

function LicensesPageHeader({
    onFilterChange,
    licenses,
    getLicenses,
}: {
    onFilterChange: (key: 'all' | 'linked' | 'unlinked') => void;
    licenses: Array<License>;
    getLicenses: () => Promise<void>;
}) {
    const { watchTx, fetchR1Price } = useBlockchainContext() as BlockchainContextType;

    fetchR1Price().then(console.log);

    const [isLoading, setLoading] = useState<boolean>(false);
    const [timestamp, setTimestamp] = useState<Date>(getNextEpochTimestamp());

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
    const futureClaimableAmount = useMemo(
        () => licenses.reduce((acc, license) => acc + license.remainingAmount, 0n),
        [licenses],
    );

    const claimAll = async () => {
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            setLoading(true);

            // TODO: Check if we can do another transaction for MNDs
            const txParameters = await Promise.all(
                licenses
                    .filter((license) => license.type === 'ND')
                    .map(async (license) => {
                        if (!license.isLinked || (await license.rewards) === 0n) {
                            return;
                        }
                        //TODO decide if we want to store this data in the license object
                        const { epochs, epochs_vals, eth_signatures } = await getNodeEpochsRange(
                            license.nodeAddress,
                            Number(license.lastClaimEpoch),
                            getCurrentEpoch() - 1,
                        );
                        const computeParam = {
                            licenseId: license.licenseId,
                            nodeAddress: license.nodeAddress,
                            epochs: epochs.map((epoch) => BigInt(epoch)),
                            availabilies: epochs_vals,
                        };
                        return { computeParam, eth_signatures };
                    }),
            ).then((a) => a.filter((x): x is { computeParam: ComputeParam; eth_signatures: `0x${string}`[] } => !!x));

            if (!txParameters.length) {
                toast.error('No rewards to claim at the moment.');
                throw new Error('No rewards to claim');
            }

            const txHash = await walletClient.writeContract({
                address: ndContractAddress,
                abi: NDContractAbi,
                functionName: 'claimRewards',
                args: [
                    [...txParameters.map(({ computeParam }) => computeParam)],
                    [...txParameters.map(({ eth_signatures }) => eth_signatures)],
                ],
            });

            await watchTx(txHash, publicClient);
            getLicenses();

            console.log('Finished watching transaction.');
        } catch (err: any) {
            console.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = (label: string, value) => (
        <div className="col gap-1">
            <div className="text-sm font-medium text-white/85">{label}</div>
            <div className="text-lg font-medium text-white lg:text-xl">{value}</div>
        </div>
    );

    return (
        <div className="flex gap-6">
            <div className="relative w-full rounded-3xl">
                <div className="col relative z-10 h-full gap-4 rounded-3xl bg-[#3f67bf] px-8 py-7 lg:gap-6">
                    <div className="flex justify-between border-b-2 border-white/10 pb-4 lg:pb-6">
                        <div className="row gap-2.5">
                            <img src={Logo} alt="Logo" className="h-7 filter" />
                            <div className="text-lg font-medium text-white">Rewards</div>
                        </div>

                        <Button
                            className="h-9"
                            color="primary"
                            size="sm"
                            variant="faded"
                            isLoading={isLoading}
                            onPress={claimAll}
                        >
                            <div className="text-sm">Claim all</div>
                        </Button>
                    </div>

                    <div className="col gap-8 lg:gap-10">
                        <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row lg:justify-between">
                            {renderItem(
                                'Claimable ($R1)',
                                isLoadingRewards ? '...' : parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(2)),
                            )}
                            {renderItem('Earned ($R1)', fBI(earnedAmount, 18))}
                            {renderItem('Future Claimable ($R1)', fBI(futureClaimableAmount, 18))}
                            {renderItem('Future Claimable ($)', '-')}
                        </div>

                        <div className="flex flex-col-reverse justify-between gap-4 lg:flex-row lg:items-end lg:gap-0">
                            <div className="col gap-1.5">
                                <div className="text-base font-medium text-white lg:text-lg">Licenses</div>

                                <Tabs
                                    aria-label="Tabs"
                                    color="default"
                                    radius="lg"
                                    size="lg"
                                    classNames={{
                                        tabList: 'p-1.5 bg-[#345aad]',
                                        tabContent: 'text-[15px] text-white',
                                    }}
                                    onSelectionChange={(key) => {
                                        onFilterChange(key as 'all' | 'linked' | 'unlinked');
                                    }}
                                >
                                    <Tab key="all" title="All" />
                                    <Tab
                                        key="linked"
                                        title={
                                            <div className="row gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                Linked
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="unlinked"
                                        title={
                                            <div className="row gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                Unlinked
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
                                        getLicenses();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-1 left-0 right-0 h-20 rounded-3xl bg-[#658bdc]"></div>
            </div>
        </div>
    );
}

export default LicensesPageHeader;
