import { getNodeEpochsRange, getNodeLastEpoch } from '@lib/api/oracles';
import { getCurrentEpoch, getLicenseAssignEpoch } from '@lib/config';
import useAwait from '@lib/useAwait';
import { arrayAverage, throttledToastOracleError } from '@lib/utils';
import { CardHorizontal } from '@shared/cards/CardHorizontal';
import { SmallTag } from '@shared/SmallTag';
import SyncingOraclesTag from '@shared/SyncingOraclesTag';
import clsx from 'clsx';
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

export const LicenseCardDetails = ({ license }: { license: License }) => {
    const [rewards, isLoadingRewards] = useAwait(license.isLinked ? license.rewards : 0n);
    const poaiRewards = license.type === 'ND' ? license.r1PoaiRewards : 0n;

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

    const getTitle = (text: string) => <div className="text-base font-medium">{text}</div>;

    const getLine = (
        label: string,
        value: string | number | JSX.Element,
        isHighlighted: boolean = false,
        isAproximate: boolean = false,
    ) => (
        <div className="row justify-between gap-3 text-sm min-[410px]:justify-start">
            <div className="min-w-[50%] text-slate-500">{label}</div>
            <div
                className={clsx({
                    'font-medium text-primary': isHighlighted,
                })}
            >
                {isAproximate ? '~' : ''}
                {value}
            </div>
        </div>
    );

    const getNodePerformanceItem = (key: number, label: string, value: number | undefined) =>
        cloneElement(
            <CardHorizontal
                label={`${label} Availability`}
                value={value === undefined ? '...' : `${parseFloat(((value / 255) * 100).toFixed(1))}%`}
                isSmall
                isFlexible
                isDarker
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

    return (
        <div className="mx-4 mb-3 rounded-2xl bg-slate-100 px-6 py-[18px]">
            <div className="col gap-[18px]">
                <div
                    className={clsx('text-sm lg:text-base xl:gap-0', {
                        'border-b-2 border-slate-200 pb-[18px]': license.isLinked,
                    })}
                >
                    <div className="flex w-full flex-col gap-6 larger:flex-row">
                        <div className="col flex-1 gap-3">
                            {getTitle('Details')}

                            <div className="col flex-1 gap-1.5">
                                {getLine('License type', <SmallTag variant={license.type}>{license.type}</SmallTag>)}
                                {getLine(
                                    'Assign timestamp',
                                    license.assignTimestamp === 0n
                                        ? 'N/A'
                                        : new Date(Number(license.assignTimestamp) * 1000).toLocaleString(),
                                )}
                                {getLine(
                                    'Last claimed epoch',
                                    license.lastClaimEpoch === 0n ? 'N/A' : Number(license.lastClaimEpoch),
                                )}
                                {getLine(
                                    'Claimable epochs',
                                    Number(license.claimableEpochs),
                                    Number(license.claimableEpochs) > 0,
                                )}
                            </div>

                            <div className="mt-3">{getTitle('Proof of Availability')}</div>

                            <div className="col flex-1 gap-1.5">
                                {getLine(
                                    'Initial amount',
                                    parseFloat(
                                        Number(formatUnits(license.totalAssignedAmount ?? 0n, 18)).toFixed(2),
                                    ).toLocaleString(),
                                )}
                                {getLine(
                                    'Remaining amount',
                                    parseFloat(
                                        Number(formatUnits(license.remainingAmount ?? 0n, 18)).toFixed(2),
                                    ).toLocaleString(),
                                )}
                            </div>
                        </div>

                        <div className="col flex-1 gap-3">
                            {getTitle('Claimable Rewards')}

                            {getLine(
                                'Total amount ($R1)',
                                isLoadingRewards ? (
                                    '...'
                                ) : rewards === undefined ? (
                                    <SyncingOraclesTag />
                                ) : (
                                    parseFloat(
                                        Number(formatUnits((rewards ?? 0n) + (poaiRewards ?? 0n), 18)).toFixed(4),
                                    ).toLocaleString()
                                ),
                                (rewards ?? 0n) > 0,
                            )}

                            <div className="col gap-3">
                                <div className="mt-3">{getTitle('Rewards Summary')}</div>

                                <div className="col flex-1 gap-1.5">
                                    {getLine(
                                        'Proof of Availability',
                                        isLoadingRewards ? (
                                            '...'
                                        ) : rewards === undefined ? (
                                            <SyncingOraclesTag />
                                        ) : (
                                            parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(4)).toLocaleString()
                                        ),
                                        false,
                                    )}
                                    {getLine(
                                        'Proof of AI',
                                        isLoadingRewards ? (
                                            '...'
                                        ) : rewards === undefined ? (
                                            <SyncingOraclesTag />
                                        ) : (
                                            parseFloat(Number(formatUnits(poaiRewards ?? 0n, 18)).toFixed(4)).toLocaleString()
                                        ),
                                        false,
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {license.isLinked && (
                    <div className="col -mt-0.5 gap-3">
                        <div className="row gap-3">
                            {getTitle('Node performance')}

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
        </div>
    );
};
