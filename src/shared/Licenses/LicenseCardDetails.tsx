import useAwait from '@lib/useAwait';
import clsx from 'clsx';
import { useState } from 'react';
import { RiTimeLine } from 'react-icons/ri';
import { License } from 'types';
import { formatUnits } from 'viem';

const nodePerformanceItems = [
    {
        label: 'Last Epoch',
        classes: 'bg-teal-100 text-teal-600',
    },
    {
        label: 'All time average',
        classes: 'bg-purple-100 text-purple-600',
    },
    {
        label: 'Last week average',
        classes: 'bg-orange-100 text-orange-600',
    },
];

export const LicenseCardDetails = ({ license }: { license: License }) => {
    const [rewards, isLoadingRewards] = useAwait(license.isLinked ? license.rewards : 0n);
    const [nodePerformance, setNodePerformance] = useState<[number, number, number]>([0, 0, 0]);

    const getTitle = (text: string) => <div className="text-base font-medium lg:text-lg">{text}</div>;

    const getLine = (label: string, value: string | number, isHighlighted: boolean = false) => (
        <div className="row justify-between gap-3 min-[410px]:justify-start">
            <div className="min-w-[50%] text-slate-500">{label}</div>
            <div
                className={clsx({
                    'font-medium text-primary': isHighlighted,
                })}
            >
                {value}
            </div>
        </div>
    );

    const getNodePerformanceItem = (key: number, label: string, value: number, classes: string) => (
        <div key={key} className="row gap-2 sm:gap-3">
            <div className={`rounded-full p-1.5 sm:p-3.5 ${classes}`}>
                <RiTimeLine className="text-2xl" />
            </div>

            <div className="col gap-1 xl:gap-0">
                <div className="text-sm leading-4 text-slate-500 xl:text-base">{label}</div>
                <div className="text-sm font-medium xl:text-base">{value}h</div>
            </div>
        </div>
    );

    return (
        <div className="px-5 py-5 md:px-8 md:py-7">
            <div className="col gap-6 lg:gap-8">
                <div className="flex flex-col justify-between gap-3 border-b-2 border-slate-200 pb-6 text-sm lg:pb-8 lg:text-base xl:flex-row xl:gap-0">
                    <div className="col flex-1 gap-6">
                        <div className="col gap-3">
                            {getTitle('Node details')}

                            {getLine('Assign timestamp', new Date(Number(license.assignTimestamp) * 1000).toLocaleString())}
                            {getLine('Last claimed epoch', Number(license.lastClaimEpoch))}
                            {getLine('Claimable epochs', Number(license.claimableEpochs), true)}

                            {getTitle('Proof of Availability')}

                            {getLine('Initial amount', Number(formatUnits(license.totalAssignedAmount ?? 0n, 18)).toFixed(2))}
                            {getLine('Remaining amount', Number(formatUnits(license.remainingAmount ?? 0n, 18)).toFixed(2))}
                        </div>

                        <div className="col flex-1 gap-6">
                            <div className="col gap-3">
                                {getTitle('Rewards')}

                                {getLine(
                                    'Total amount ($R1)',
                                    isLoadingRewards ? '...' : Number(formatUnits(rewards ?? 0n, 18)).toFixed(2),
                                    true,
                                )}

                                <div className="col gap-3">
                                    {getTitle('Summary')}

                                    {getLine(
                                        'Proof of Availability',
                                        isLoadingRewards ? '...' : Number(formatUnits(rewards ?? 0n, 18)).toFixed(2),
                                    )}

                                    {getLine('Proof of AI', '0')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col -mt-0.5 gap-3">
                    {getTitle('Node performance')}

                    <div className="row gap-4 sm:gap-8">
                        <div className="text-sm text-slate-500 sm:text-base">Uptime per epoch</div>

                        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                            {nodePerformanceItems.map(({ label, classes }, index) =>
                                getNodePerformanceItem(index, label, nodePerformance[index], classes),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
