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
            <div className="row w-full justify-between gap-12 px-6 py-6">
                <div className="text-[15px] font-medium text-slate-500">{label}</div>
                <div
                    className={clsx('font-semibold', {
                        'text-xl': !isSmall,
                        'text-lg': isSmall,
                    })}
                >
                    {value}
                </div>
            </div>
        </CardFlexible>
    );
};
