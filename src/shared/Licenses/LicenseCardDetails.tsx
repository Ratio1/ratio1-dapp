import { Button } from '@heroui/button';
import { getNodeEpochsRange, getNodeLastEpoch } from '@lib/api/oracles';
import { getCurrentEpoch, getLicenseAssignEpoch } from '@lib/config';
import useAwait from '@lib/useAwait';
import { arrayAverage, getValueWithLabel, throttledToastOracleError } from '@lib/utils';
import { CardHorizontal } from '@shared/cards/CardHorizontal';
import SyncingOraclesTag from '@shared/SyncingOraclesTag';
import { cloneElement, useMemo } from 'react';
import { License } from 'typedefs/blockchain';
import { formatUnits } from 'viem';

const nodePerformanceItems = [
    {
        label: 'Last Epoch',
    },
    {
        label: 'Last Week Avg.',
    },
    {
        label: 'All Time Avg.',
    },
];

export const LicenseCardDetails = ({
    license,
    action,
    isClaimingAllRewardsPoA,
    isClaimingAllRewardsPoAI,
}: {
    license: License;
    action?: (
        type: 'link' | 'unlink' | 'claimRewardsPoA' | 'claimRewardsPoAI' | 'changeNode' | 'burn',
        license: License,
    ) => void;
    isClaimingAllRewardsPoA?: boolean;
    isClaimingAllRewardsPoAI?: boolean;
}) => {
    const [rewardsPoA, isLoadingRewardsPoA] = useAwait(license.isLinked ? license.rewards : 0n);
    const rewardsPoAI = license.type === 'ND' ? license.r1PoaiRewards : 0n;

    const nodePerformancePromise: Promise<{
        epochs: number[];
        epochsVals: number[];
    }> = useMemo(async () => {
        if (!license.isLinked) {
            return {
                epochs: [],
                epochsVals: [],
            };
        }

        const licenseAssignEpoch = getLicenseAssignEpoch(license.assignTimestamp);
        const currentEpoch = getCurrentEpoch();

        const startEpoch = licenseAssignEpoch;
        const endEpoch = currentEpoch - 1;

        try {
            const result =
                licenseAssignEpoch === currentEpoch
                    ? await getNodeLastEpoch(license.nodeAddress)
                    : await getNodeEpochsRange(license.nodeAddress, startEpoch, endEpoch);

            return {
                epochs: result.epochs,
                epochsVals: result.epochs_vals,
            };
        } catch (error) {
            console.error(error);
            throttledToastOracleError();

            return {
                epochs: [],
                epochsVals: [],
            };
        }
    }, [license]);

    const [nodePerformance, isLoadingNodePerformance] = useAwait(nodePerformancePromise);

    const getNodePerformanceItem = (key: number, label: string, value: number | undefined) =>
        cloneElement(
            <CardHorizontal
                label={`${label} Availability`}
                value={value === undefined ? '...' : `${parseFloat(((value / 255) * 100).toFixed(1))}%`}
                isSmall
                isFlexible
            />,
            { key },
        );

    const getNodePerformanceValue = (index: number): number | undefined => {
        if (!nodePerformance || !nodePerformance.epochs.length) {
            return;
        }

        const values = nodePerformance.epochsVals;

        switch (index) {
            case 0:
                return values[values.length - 1];

            case 1:
                return arrayAverage(values);

            case 2:
                return arrayAverage(values.slice(-7));

            default:
                return;
        }
    };

    // Checks if the last epoch isn't the expected current epoch - 1, which means the oracles are still syncing the new epoch
    const isEpochTransitioning = () => {
        if (!nodePerformance) {
            return false;
        }

        return nodePerformance.epochs[nodePerformance.epochs.length - 1] !== getCurrentEpoch() - 1;
    };

    const getSectionTitle = (title: string) => <div className="text-[17px] font-semibold">{title}</div>;

    return (
        <div className="col gap-3">
            {/* Rewards */}
            <div className="col gap-1.5">
                {getSectionTitle('Rewards')}

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 larger:grid-cols-3">
                    <DetailsCard>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col gap-2.5">
                                <div className="text-sm font-medium text-slate-500">Total Rewards</div>

                                {isLoadingRewardsPoA ? (
                                    <div className="text-lg font-semibold leading-none text-slate-500">...</div>
                                ) : rewardsPoA === undefined ? (
                                    <SyncingOraclesTag />
                                ) : (
                                    <div className="flex items-end gap-1.5">
                                        <div className="text-lg font-semibold leading-none text-primary">
                                            {parseFloat(
                                                Number(formatUnits((rewardsPoA ?? 0n) + (rewardsPoAI ?? 0n), 18)).toFixed(4),
                                            ).toLocaleString()}

                                            <span className="text-slate-400"> $R1</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DetailsCard>

                    <DetailsCard>
                        <div className="row justify-between gap-4">
                            <div className="col gap-2.5">
                                <div className="text-sm font-medium text-slate-500">Proof of Availability</div>

                                {isLoadingRewardsPoA ? (
                                    <div className="text-lg font-semibold leading-none text-slate-500">...</div>
                                ) : rewardsPoA === undefined ? (
                                    <SyncingOraclesTag />
                                ) : (
                                    <div className="flex items-end gap-1.5">
                                        <div className="text-lg font-semibold leading-none text-primary">
                                            {parseFloat(Number(formatUnits(rewardsPoA ?? 0n, 18)).toFixed(4)).toLocaleString()}

                                            <span className="text-slate-400"> $R1</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!!rewardsPoA && (
                                <Button
                                    className="h-9 border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                        if (action) {
                                            action('claimRewardsPoA', license);
                                        }
                                    }}
                                    isLoading={license.isClaimingRewardsPoA}
                                    isDisabled={isLoadingRewardsPoA || isClaimingAllRewardsPoA}
                                >
                                    <div className="text-sm">Claim</div>
                                </Button>
                            )}
                        </div>
                    </DetailsCard>

                    <DetailsCard>
                        <div className="row gap-4ß justify-between">
                            <div className="col gap-2.5">
                                <div className="text-sm font-medium text-slate-500">Proof of AI</div>

                                <div className="text-lg font-semibold leading-none text-purple-600">
                                    {parseFloat(Number(formatUnits(rewardsPoAI ?? 0n, 18)).toFixed(4)).toLocaleString()}

                                    <span className="text-slate-400"> $R1</span>
                                </div>
                            </div>

                            {!!rewardsPoAI && (
                                <Button
                                    className="h-9 border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                        if (action) {
                                            action('claimRewardsPoAI', license);
                                        }
                                    }}
                                    isLoading={license.isClaimingRewardsPoAI}
                                    // isLoadingRewardsPoA is also used here in order to disable the button while licenses are refreshed
                                    isDisabled={isLoadingRewardsPoA || isClaimingAllRewardsPoAI}
                                >
                                    <div className="text-sm">Claim</div>
                                </Button>
                            )}
                        </div>
                    </DetailsCard>
                </div>
            </div>

            {/* License Details */}
            <div className="col gap-1.5">
                {getSectionTitle('License Details')}

                <DetailsCard>
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
                        {getValueWithLabel('License type', license.type)}

                        {getValueWithLabel(
                            'Assign timestamp',
                            license.assignTimestamp === 0n
                                ? 'N/A'
                                : new Date(Number(license.assignTimestamp) * 1000).toLocaleString(),
                        )}

                        {getValueWithLabel(
                            'Last claimed epoch',
                            license.lastClaimEpoch === 0n ? 'N/A' : Number(license.lastClaimEpoch),
                        )}

                        {getValueWithLabel(
                            'Claimable epochs',
                            Number(license.claimableEpochs),
                            Number(license.claimableEpochs) > 0 ? 'text-primary' : undefined,
                        )}

                        {getValueWithLabel(
                            'Proof of Availability (Initial)',
                            parseFloat(Number(formatUnits(license.totalAssignedAmount ?? 0n, 18)).toFixed(2)).toLocaleString(),
                        )}

                        {getValueWithLabel(
                            'Proof of Availability (Remaining)',
                            parseFloat(Number(formatUnits(license.remainingAmount ?? 0n, 18)).toFixed(2)).toLocaleString(),
                        )}
                    </div>
                </DetailsCard>
            </div>

            {license.isLinked && (
                <div className="col gap-1.5">
                    <div className="row gap-3">
                        {getSectionTitle('Node Performance')}

                        {isEpochTransitioning() && <SyncingOraclesTag />}
                    </div>

                    {!isEpochTransitioning() && (
                        <div className="flex flex-wrap items-stretch gap-2 md:gap-3">
                            {isLoadingNodePerformance ? (
                                <>
                                    {nodePerformanceItems.map(({ label }, index) =>
                                        getNodePerformanceItem(index, label, undefined),
                                    )}
                                </>
                            ) : (
                                <>
                                    {nodePerformanceItems.map(({ label }, index) =>
                                        getNodePerformanceItem(index, label, getNodePerformanceValue(index)),
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const DetailsCard = ({ children }: { children: React.ReactNode }) => {
    return <div className="rounded-xl bg-slate-100 px-4 py-4">{children}</div>;
};
