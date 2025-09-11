import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export const BorderedCard: FunctionComponent<
    PropsWithChildren<{
        isHoverable?: boolean;
        isLight?: boolean;
        onClick?: () => void;
        footer?: React.ReactNode;
        isRoundedDouble?: boolean;
        disableWrapper?: boolean;
        useFixedwidth?: boolean;
    }>
> = ({ children, isHoverable, isLight = true, onClick, footer, isRoundedDouble, disableWrapper, useFixedwidth }) => {
    return (
        <div
            className={clsx('w-full overflow-hidden border-2 border-slate-100 bg-white', {
                'cursor-pointer hover:border-slate-200': isHoverable,
                'rounded-xl': !isRoundedDouble,
                'rounded-2xl': isRoundedDouble,
                'min-w-[700px] md:min-w-[820px] lg:min-w-max': useFixedwidth,
            })}
            onClick={onClick}
        >
            <div
                className={clsx('col w-full', {
                    'bg-[#fdfdfd]': isLight,
                    'gap-4 px-4 py-4 lg:px-6': !disableWrapper,
                })}
            >
                {children}
            </div>

            {!!footer && <div className="border-t-2 border-slate-100">{footer}</div>}
        </div>
    );
};
