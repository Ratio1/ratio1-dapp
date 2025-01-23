import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

interface Props {
    fullWidth?: boolean;
}

export const BigCard: FunctionComponent<PropsWithChildren<Props>> = ({ children, fullWidth }) => {
    return (
        <div
            className={clsx('col gap-4 rounded-3xl bg-lightAccent px-5 py-5 lg:gap-6 lg:px-10 lg:py-10', {
                'w-full': fullWidth,
            })}
        >
            {children}
        </div>
    );
};
