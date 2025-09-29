import { cn } from '@heroui/theme';
import { FunctionComponent, JSX, PropsWithChildren } from 'react';
import { BorderedCard } from './BorderedCard';

interface Props {
    icon: JSX.Element;
    title: string;
    label?: JSX.Element;
    isDisabled?: boolean;
}

export const CardWithHeader: FunctionComponent<PropsWithChildren<Props>> = ({ children, icon, title, label, isDisabled }) => {
    return (
        <BorderedCard disableWrapper isBorderDark>
            <div className="bg-slate-100 px-4 py-4 lg:px-6">
                <div className="row justify-between">
                    <div className="row gap-2 lg:gap-2.5">
                        <div className={cn('rounded-full bg-primary p-1.5 text-lg text-white', isDisabled && 'bg-slate-500')}>
                            {icon}
                        </div>
                        <div className={cn('text-base font-semibold leading-6 larger:text-lg', isDisabled && 'text-slate-600')}>
                            {title}
                        </div>
                    </div>

                    {!!label && <div>{label}</div>}
                </div>
            </div>

            <div className="h-full px-6 py-4">{children}</div>
        </BorderedCard>
    );
};
