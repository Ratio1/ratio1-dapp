import { FunctionComponent, PropsWithChildren } from 'react';

export const LicenseSmallCard: FunctionComponent<PropsWithChildren> = ({ children }) => (
    <div className="flex h-[64px] w-full min-w-24 items-center rounded-xl border-2 border-slate-100 px-4 py-2.5 sm:w-auto sm:justify-center">
        {children}
    </div>
);
