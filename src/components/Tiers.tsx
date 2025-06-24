import { fN } from '@lib/utils';
import { LargeValueWithLabel } from '@shared/LargeValueWithLabel';
import clsx from 'clsx';
import { PriceTier } from 'typedefs/blockchain';

function Tiers({ currentStage, stages }: { currentStage: number; stages: PriceTier[] }) {
    return (
        <>
            <div className="col gap-5 lg:gap-6">
                <div className="flex justify-between">
                    <div className="col flex w-full justify-between gap-4 md:gap-6 lg:flex-row lg:gap-8">
                        <LargeValueWithLabel
                            label={`Current Price (T${currentStage})`}
                            value={`$${stages[currentStage - 1].usdPrice}`}
                        />

                        <LargeValueWithLabel
                            label="Remaining Units"
                            value={`${stages[currentStage - 1].totalUnits - stages[currentStage - 1].soldUnits}/${stages[currentStage - 1].totalUnits}`}
                        />

                        <LargeValueWithLabel
                            label={`Next Price (T${currentStage + 1})`}
                            value={`$${stages[currentStage].usdPrice}`}
                        />
                    </div>
                </div>

                {/* Web */}
                <div className="hidden justify-between larger:flex">
                    {stages.map((stage) => (
                        <div
                            key={stage.index}
                            className={clsx('center-all relative min-w-[60px] flex-col gap-4 rounded-full py-3', {
                                'bg-gradient-to-t from-slate-200': stage.index === currentStage,
                            })}
                        >
                            <div
                                className={clsx('rounded-full px-2.5 py-0.5 text-[15px] font-medium', {
                                    'bg-gray-300 text-body': stage.index != currentStage,
                                    'bg-body text-white': stage.index === currentStage,
                                })}
                            >
                                ${fN(stage.usdPrice)}
                            </div>

                            <div className="flex h-36 w-1 flex-col flex-nowrap justify-end overflow-hidden rounded-full bg-gray-300">
                                <div
                                    className={clsx('overflow-hidden rounded-full bg-primary transition-all duration-500', {
                                        '!bg-green-300': stage.totalUnits === stage.soldUnits,
                                    })}
                                    style={{ height: `${(100 * stage.soldUnits) / stage.totalUnits}%` }}
                                ></div>
                            </div>

                            <div
                                className={clsx('text-sm', {
                                    'text-primary': stage.index === currentStage,
                                })}
                            >
                                {stage.index >= currentStage ? stage.totalUnits - stage.soldUnits : '-'}
                            </div>

                            <div
                                className={clsx('center-all h-10 w-10 rounded-full text-[15px] font-medium tracking-wider', {
                                    'bg-gray-300 text-body': stage.index != currentStage,
                                    'bg-body text-white': stage.index === currentStage,
                                })}
                            >
                                T{stage.index}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile */}
                <div className="col flex larger:hidden">
                    {stages.map((stage) => (
                        <div
                            key={stage.index}
                            className={clsx(
                                'relative -mx-2 flex flex-row-reverse items-center gap-4 rounded-full px-3 py-2.5',
                                {
                                    'bg-slate-200': stage.index === currentStage,
                                },
                            )}
                        >
                            <div className="flex min-w-[62px] justify-end">
                                <div
                                    className={clsx(
                                        'w-full rounded-full px-2.5 py-0.5 text-center text-sm font-medium lg:text-[15px]',
                                        {
                                            'bg-gray-300 text-body': stage.index != currentStage,
                                            'bg-body text-white': stage.index === currentStage,
                                        },
                                    )}
                                >
                                    ${fN(stage.usdPrice)}
                                </div>
                            </div>

                            <div className="flex h-1 w-full flex-row overflow-hidden rounded-full bg-gray-300">
                                <div
                                    className={clsx('overflow-hidden rounded-full bg-primary transition-all duration-500', {
                                        '!bg-green-300': stage.totalUnits === stage.soldUnits,
                                    })}
                                    style={{ width: `${(100 * stage.soldUnits) / stage.totalUnits}%` }}
                                ></div>
                            </div>

                            <div
                                className={clsx('text-sm', {
                                    'text-primary': stage.index === currentStage,
                                })}
                            >
                                {stage.index >= currentStage ? stage.totalUnits - stage.soldUnits : '-'}
                            </div>

                            <div className="flex w-9">
                                <div
                                    className={clsx(
                                        'center-all h-9 w-9 rounded-full text-sm font-medium tracking-wider lg:text-[15px]',
                                        {
                                            'bg-gray-300 text-body': stage.index != currentStage,
                                            'bg-body text-white': stage.index === currentStage,
                                        },
                                    )}
                                >
                                    T{stage.index}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Tiers;
