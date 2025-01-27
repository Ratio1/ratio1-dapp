import { NDContractAbi } from '@blockchain/NDContract';
import { ndContractAddress } from '@lib/config';
import { fN } from '@lib/utils';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';

const INITIAL_STATE: {
    index: number;
    usdPrice: number;
    totalUnits: number;
    soldUnits: number;
}[] = [
    { index: 1, usdPrice: 500, totalUnits: 89, soldUnits: 0 },
    { index: 2, usdPrice: 750, totalUnits: 144, soldUnits: 0 },
    { index: 3, usdPrice: 1000, totalUnits: 233, soldUnits: 0 },
    { index: 4, usdPrice: 1500, totalUnits: 377, soldUnits: 0 },
    { index: 5, usdPrice: 2000, totalUnits: 610, soldUnits: 0 },
    { index: 6, usdPrice: 2500, totalUnits: 987, soldUnits: 0 },
    { index: 7, usdPrice: 3000, totalUnits: 1597, soldUnits: 0 },
    { index: 8, usdPrice: 3500, totalUnits: 2584, soldUnits: 0 },
    { index: 9, usdPrice: 4000, totalUnits: 4181, soldUnits: 0 },
    { index: 10, usdPrice: 5000, totalUnits: 6765, soldUnits: 0 },
    { index: 11, usdPrice: 10000, totalUnits: 10946, soldUnits: 0 },
    { index: 12, usdPrice: 20000, totalUnits: 17711, soldUnits: 0 },
];

export default function Tiers() {
    const [currentStage, setCurrentStage] = useState<number>(1);
    const [stages, setStages] = useState<
        {
            index: number;
            usdPrice: number;
            totalUnits: number;
            soldUnits: number;
        }[]
    >(INITIAL_STATE);

    const publicClient = usePublicClient();

    /*
    useEffect(() => {
        setTimeout(() => {
            setStages([
                { index: 1, usdPrice: 500, totalUnits: 89, soldUnits: 89 },
                { index: 2, usdPrice: 750, totalUnits: 144, soldUnits: 144 },
                { index: 3, usdPrice: 1000, totalUnits: 233, soldUnits: 233 },
                { index: 4, usdPrice: 1500, totalUnits: 377, soldUnits: 262 },
                { index: 5, usdPrice: 2000, totalUnits: 610, soldUnits: 0 },
                { index: 6, usdPrice: 2500, totalUnits: 987, soldUnits: 0 },
                { index: 7, usdPrice: 3000, totalUnits: 1597, soldUnits: 0 },
                { index: 8, usdPrice: 3500, totalUnits: 2584, soldUnits: 0 },
                { index: 9, usdPrice: 4000, totalUnits: 4181, soldUnits: 0 },
                { index: 10, usdPrice: 5000, totalUnits: 6765, soldUnits: 0 },
                { index: 11, usdPrice: 10000, totalUnits: 10946, soldUnits: 0 },
                { index: 12, usdPrice: 20000, totalUnits: 17711, soldUnits: 0 },
            ]);
        }, 500);
    }, []);
    */

    useEffect(() => {
        if (!publicClient) {
            return;
        }

        publicClient
            .readContract({
                address: ndContractAddress,
                abi: NDContractAbi,
                functionName: 'currentPriceTier',
            })
            .then(setCurrentStage);

        publicClient
            .readContract({
                address: ndContractAddress,
                abi: NDContractAbi,
                functionName: 'getPriceTiers',
            })
            .then((priceTiers) => {
                setStages(
                    priceTiers.map((tier, index) => ({
                        index: index + 1,
                        usdPrice: Number(tier.usdPrice),
                        totalUnits: Number(tier.totalUnits),
                        soldUnits: Number(tier.soldUnits),
                    })),
                );
            });
    }, []);

    return (
        <>
            <div className="col gap-5 lg:gap-7">
                <div className="flex justify-between">
                    <div className="col flex w-full justify-between gap-8 lg:flex-row lg:gap-28">
                        <div className="col text-center lg:text-left">
                            <div className="text-lg font-semibold lg:text-xl">Current Price (T{currentStage})</div>
                            <div className="text-[20px] font-bold text-primary lg:text-[22px]">
                                ${stages[currentStage - 1].usdPrice}
                            </div>
                        </div>

                        <div className="col text-center lg:text-left">
                            <div className="text-lg font-semibold lg:text-xl">Remaining Units</div>
                            <div className="text-[20px] font-bold text-primary lg:text-[22px]">
                                {stages[currentStage - 1].totalUnits - stages[currentStage - 1].soldUnits}/
                                {stages[currentStage - 1].totalUnits}
                            </div>
                        </div>

                        <div className="col text-center lg:text-left">
                            <div className="text-lg font-semibold lg:text-xl">Next Price (T{currentStage + 1})</div>
                            <div className="text-[20px] font-bold text-primary lg:text-[22px]">
                                ${stages[currentStage].usdPrice}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Web */}
                <div className="larger:flex hidden justify-between">
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
                <div className="larger:hidden col flex">
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
