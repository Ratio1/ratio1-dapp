import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

interface Props {
    title?: string;
    label?: React.ReactNode;
    tightGap?: boolean;
}

export const SlateCard: FunctionComponent<PropsWithChildren<Props>> = ({ children, title, label, tightGap }) => {
    return (
        <div className="col justify-center gap-4 rounded-lg bg-slate-100 px-4 py-5">
            {title && (
                <div className="row justify-between">
                    <div className="text-[17px] font-medium leading-none">{title}</div>
                    {label && <>{label}</>}
                </div>
            )}

            <div
                className={clsx('col', {
                    'gap-4': !tightGap,
                    'gap-3': tightGap,
                })}
            >
                {children}
            </div>
        </div>
    );
};
