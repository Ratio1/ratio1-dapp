import clsx from 'clsx';
import { PropsWithChildren } from 'react';

interface Props {
    useFixedwidth?: boolean;
}

export default function ListHeader({ children, useFixedwidth }: PropsWithChildren<Props>) {
    return (
        <div
            className={clsx('w-full rounded-xl border-2 border-slate-100 bg-slate-100 px-4 py-4 text-slate-500 lg:px-6', {
                'min-w-[700px] md:min-w-[820px] lg:min-w-max': useFixedwidth,
            })}
        >
            <div className="compact flex w-full justify-between">{children}</div>
        </div>
    );
}
