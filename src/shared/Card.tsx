import { FunctionComponent, PropsWithChildren } from 'react';

interface Props {
    icon: JSX.Element;
    title: string;
    label?: JSX.Element;
}

export const Card: FunctionComponent<PropsWithChildren<Props>> = ({ children, icon, title, label }) => {
    return (
        <div className="col gap-0 overflow-hidden rounded-2xl border border-[#e3e4e8] bg-light">
            <div className="bg-lightBlue px-6 py-4 larger:px-10 larger:py-6">
                <div className="row justify-between">
                    <div className="row gap-2 lg:gap-3">
                        <div className="rounded-full bg-primary p-1.5 text-lg text-white lg:p-2 lg:text-xl">{icon}</div>
                        <div className="text-lg font-bold leading-6 larger:text-xl">{title}</div>
                    </div>

                    {!!label && <div>{label}</div>}
                </div>
            </div>

            <div className="h-full px-6 py-4 lg:px-10 lg:py-6">{children}</div>
        </div>
    );
};
