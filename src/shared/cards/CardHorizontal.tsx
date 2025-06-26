import clsx from 'clsx';
import { JSX } from 'react';
import { CardFlexible } from './CardFlexible';

export const CardHorizontal = ({
    label,
    value,
    isFlexible,
    isSmall,
    isDarker,
}: {
    label: string | JSX.Element;
    value: number | string | JSX.Element;
    isFlexible?: boolean;
    isSmall?: boolean;
    isDarker?: boolean;
}) => {
    return (
        <CardFlexible isFlexible={isFlexible} isDarker={isDarker}>
            <div className="row w-full justify-between gap-12 p-4 md:p-6">
                <div className="text-sm font-medium text-slate-500 md:text-[15px]">{label}</div>
                <div
                    className={clsx('font-semibold', {
                        'text-xl': !isSmall,
                        'text-[15px] md:text-lg': isSmall,
                    })}
                >
                    {value}
                </div>
            </div>
        </CardFlexible>
    );
};
