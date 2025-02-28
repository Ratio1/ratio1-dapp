import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export const CardFlexible: FunctionComponent<PropsWithChildren<{ isFlexible?: boolean; isDarker?: boolean }>> = ({
    children,
    isDarker,
    isFlexible,
}) => {
    return (
        <div
            className={clsx('row min-w-56 rounded-xl', {
                'flex-1': isFlexible,
                'bg-slate-100': !isDarker,
                'bg-slate-200': isDarker,
            })}
        >
            {children}
        </div>
    );
};
