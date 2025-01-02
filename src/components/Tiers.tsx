import { formatNumber } from '@lib/utils';
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
                { index: 4, price: 1500, units: 377, sold: 263 },
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
        <div className="flex flex-col gap-8">
            <div className="flex gap-14">
                <div className="flex flex-col gap-0">
                    <div className="text-xl font-bold">Current Price</div>
                    <div className="text-2xl font-bold text-primary">${stages[currentStage - 1].price}</div>
                </div>

                <div className="flex flex-col gap-0">
                    <div className="text-xl font-bold">Units </div>
                    <div className="text-2xl font-bold text-primary">
                        {stages[currentStage - 1].units - stages[currentStage - 1].sold}/{stages[currentStage - 1].units}
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                {stages.map((stage) => (
                    <div
                        key={stage.index}
                        className={clsx('center-all bg-softGray relative flex-col gap-4', {
                            'bg-blue-50': stage.index === currentStage,
                            'bg-green-100': stage.units === stage.sold,
                        })}
                    >
                        {stage.units === stage.sold ? (
                            <Label variant="green">S/O</Label>
                        ) : (
                            <Label variant={stage.index === currentStage ? 'blue' : 'gray'}>{stage.units - stage.sold}</Label>
                        )}

                        <div className="flex h-36 w-1 flex-col flex-nowrap justify-end overflow-hidden rounded-full bg-gray-300">
                            <div
                                className={clsx('overflow-hidden rounded-full bg-primary transition-all duration-500', {
                                    'bg-green-400': stage.units === stage.sold,
                                })}
                                style={{ height: `${(100 * stage.sold) / stage.units}%` }}
                            ></div>
                        </div>

                        <Label variant={stage.units === stage.sold ? 'green' : stage.index === currentStage ? 'blue' : 'gray'}>
                            <div>${formatNumber(stage.price)}</div>
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Label({ children, variant = 'blue' }) {
    return (
        <div
            className={clsx('px-1 py-1', {
                'bg-blue-100': variant === 'blue',
                'bg-green-300': variant === 'green',
                'bg-gray-200': variant === 'gray',
            })}
        >
            <div className="w-12 text-center font-medium">{children}</div>
        </div>
    );
}
