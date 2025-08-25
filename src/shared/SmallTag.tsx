import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export const SmallTag: FunctionComponent<
    PropsWithChildren<{
        variant?: 'default' | 'slate' | 'ND' | 'MND' | 'GND';
    }>
> = ({ children, variant = 'default' }) => (
    <div className="flex">
        <div
            className={clsx('center-all whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium', {
                'bg-slate-100': variant === 'default',
                'bg-slate-200': variant === 'slate',
                'bg-primary-50 text-primary': variant === 'ND',
                'bg-purple-100 text-purple-600': variant === 'MND',
                'bg-orange-100 text-orange-600': variant === 'GND',
            })}
        >
            {children}
        </div>
    </div>
);
