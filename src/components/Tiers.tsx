import { fN } from '@lib/utils';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const INITIAL_STATE: {
    index: number;
    price: number;
    units: number;
    sold: number;
}[] = [
    { index: 1, price: 500, units: 89, sold: 0 },
    { index: 2, price: 750, units: 144, sold: 0 },
    { index: 3, price: 1000, units: 233, sold: 0 },
    { index: 4, price: 1500, units: 377, sold: 0 },
    { index: 5, price: 2000, units: 610, sold: 0 },
    { index: 6, price: 2500, units: 987, sold: 0 },
    { index: 7, price: 3000, units: 1597, sold: 0 },
    { index: 8, price: 3500, units: 2584, sold: 0 },
    { index: 9, price: 4000, units: 4181, sold: 0 },
    { index: 10, price: 5000, units: 6765, sold: 0 },
    { index: 11, price: 10000, units: 10946, sold: 0 },
    { index: 12, price: 20000, units: 17711, sold: 0 },
];

export default function Tiers() {
    const [currentStage, setCurrentStage] = useState<number>(4);
    const [stages, setStages] = useState<
        {
            index: number;
            price: number;
            units: number;
            sold: number;
        }[]
    >(INITIAL_STATE);

    useEffect(() => {
        setTimeout(() => {
            setStages([
                { index: 1, price: 500, units: 89, sold: 89 },
                { index: 2, price: 750, units: 144, sold: 144 },
                { index: 3, price: 1000, units: 233, sold: 233 },
                { index: 4, price: 1500, units: 377, sold: 262 },
                { index: 5, price: 2000, units: 610, sold: 0 },
                { index: 6, price: 2500, units: 987, sold: 0 },
                { index: 7, price: 3000, units: 1597, sold: 0 },
                { index: 8, price: 3500, units: 2584, sold: 0 },
                { index: 9, price: 4000, units: 4181, sold: 0 },
                { index: 10, price: 5000, units: 6765, sold: 0 },
                { index: 11, price: 10000, units: 10946, sold: 0 },
                { index: 12, price: 20000, units: 17711, sold: 0 },
            ]);
        }, 500);
    }, []);

    return (
        <>
            <div className="col gap-5 lg:gap-7">
                <div className="flex justify-between">
                    <div className="col flex w-full justify-between gap-8 lg:flex-row lg:gap-28">
                        <div className="col text-center lg:text-left">
                            <div className="text-lg font-semibold lg:text-xl">Current Price (T{currentStage})</div>
                            <div className="text-[20px] font-bold text-primary lg:text-[22px]">
                                ${stages[currentStage - 1].price}
                            </div>
                        </div>

                        <div className="col text-center lg:text-left">
                            <div className="text-lg font-semibold lg:text-xl">Remaining Units</div>
                            <div className="text-[20px] font-bold text-primary lg:text-[22px]">
                                {stages[currentStage - 1].units - stages[currentStage - 1].sold}/
                                {stages[currentStage - 1].units}
                            </div>
                        </div>

                        <div className="col text-center lg:text-left">
                            <div className="text-lg font-semibold lg:text-xl">Next Price (T{currentStage + 1})</div>
                            <div className="text-[20px] font-bold text-primary lg:text-[22px]">
                                ${stages[currentStage].price}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Web */}
                <div className="web-only-flex flex justify-between">
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
                                ${fN(stage.price)}
                            </div>

                            <div className="flex h-36 w-1 flex-col flex-nowrap justify-end overflow-hidden rounded-full bg-gray-300">
                                <div
                                    className={clsx('overflow-hidden rounded-full bg-primary transition-all duration-500', {
                                        '!bg-green-300': stage.units === stage.sold,
                                    })}
                                    style={{ height: `${(100 * stage.sold) / stage.units}%` }}
                                ></div>
                            </div>

                            <div
                                className={clsx('text-sm', {
                                    'text-primary': stage.index === currentStage,
                                })}
                            >
                                {stage.index >= currentStage ? stage.units - stage.sold : '-'}
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
                <div className="mobile-only-flex col">
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
                                    ${fN(stage.price)}
                                </div>
                            </div>

                            <div className="flex h-1 w-full flex-row overflow-hidden rounded-full bg-gray-300">
                                <div
                                    className={clsx('overflow-hidden rounded-full bg-primary transition-all duration-500', {
                                        '!bg-green-300': stage.units === stage.sold,
                                    })}
                                    style={{ width: `${(100 * stage.sold) / stage.units}%` }}
                                ></div>
                            </div>

                            <div
                                className={clsx('text-sm', {
                                    'text-primary': stage.index === currentStage,
                                })}
                            >
                                {stage.index >= currentStage ? stage.units - stage.sold : '-'}
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
