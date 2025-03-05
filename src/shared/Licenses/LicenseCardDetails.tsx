import { getNodeEpochsRange, getNodeLastEpoch } from '@lib/api/oracles';
import { getCurrentEpoch, getLicenseAssignEpoch } from '@lib/config';
import useAwait from '@lib/useAwait';
import { arrayAverage, throttledToastOracleError } from '@lib/utils';
import { CardHorizontal } from '@shared/cards/CardHorizontal';
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

    const nodeEpochsPromise = useMemo(async () => {
        if (!license.isLinked) {
            return [];
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

            return result.epochs_vals;
        } catch (error) {
            console.error(error);
            throttledToastOracleError();
            return [];
        }
    }, [license]);

    const [nodeEpochs, isLoadingNodeEpochs] = useAwait(nodeEpochsPromise);

    const getTitle = (text: string) => <div className="font-medium">{text}</div>;

    const getLine = (label: string, value: string | number, isHighlighted: boolean = false, isAproximate: boolean = false) => (
        <div className="row justify-between gap-3 min-[410px]:justify-start">
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
        if (!nodeEpochs || !nodeEpochs.length) {
            return;
        }

        switch (index) {
            case 0:
                return nodeEpochs[nodeEpochs.length - 1];

            case 1:
                return arrayAverage(nodeEpochs);

            case 2:
                return arrayAverage(nodeEpochs.slice(-7));

            default:
                return;
        }
    };

    return (
        <div className="px-5 py-5 md:px-8 md:py-7">
            <div className="col gap-6 lg:gap-7">
                <div
                    className={clsx('text-sm lg:text-base xl:gap-0', {
                        'border-b-2 border-slate-200 pb-6 lg:pb-7': license.isLinked,
                    })}
                >
                    <div className="flex w-full flex-col gap-6 larger:flex-row">
                        <div className="col flex-1 gap-3">
                            {getTitle('Details')}

                            {getLine('License type', license.type)}
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
                            {getLine('Claimable epochs', Number(license.claimableEpochs), Number(license.claimableEpochs) > 0)}

                            <div className="mt-3">{getTitle('Proof of Availability')}</div>

                            {getLine(
                                'Initial amount',
                                parseFloat(
                                    Number(formatUnits(license.totalAssignedAmount ?? 0n, 18)).toFixed(2),
                                ).toLocaleString(),
                            )}
                            {getLine(
                                'Remaining amount',
                                parseFloat(Number(formatUnits(license.remainingAmount ?? 0n, 18)).toFixed(2)).toLocaleString(),
                            )}
                        </div>

                        <div className="col flex-1 gap-3">
                            {getTitle('Claimable Rewards')}

                            {getLine(
                                'Total amount ($R1)',
                                isLoadingRewards
                                    ? '...'
                                    : parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(4)).toLocaleString(),
                                (rewards ?? 0n) > 0,
                            )}

                            <div className="col gap-3">
                                <div className="mt-3">{getTitle('Summary')}</div>

                                {getLine(
                                    'Proof of Availability',
                                    isLoadingRewards
                                        ? '...'
                                        : parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(4)).toLocaleString(),
                                    false,
                                )}

                                {getLine('Proof of AI', '0')}
                            </div>
                        </div>
                    </div>
                </div>

                {license.isLinked && (
                    <div className="col -mt-0.5 gap-3">
                        {getTitle('Node performance')}

                        <div className="flex flex-wrap items-stretch gap-3">
                            {isLoadingNodeEpochs ? (
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
                    </div>
                )}
            </div>
        </div>
    );
};
