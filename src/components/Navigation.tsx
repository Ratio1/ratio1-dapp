import { AppRoute, mainRoutesInfo, routes } from '@lib/routes';
import clsx from 'clsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navigation() {
    const [activeRoute, setActiveRoute] = useState<number>(0);

    const navigate = useNavigate();

    const onRouteClick = (index: number, path: string) => {
        setActiveRoute(index);
        navigate(path);
    };

    return (
        <div className="flex w-full flex-col gap-3">
            {routes.map((route, index) => (
                <div key={index} onClick={() => onRouteClick(index, route.path)}>
                    <Route route={route} isActive={index === activeRoute} />
                </div>
            ))}
        </div>
    );
}

function Route({ route, isActive }: { route: AppRoute; isActive: boolean }) {
    return (
        <div
            className={clsx('min-w-44 cursor-pointer rounded-lg px-4 py-2.5 transition-all hover:bg-gray-100', {
                '!bg-primary-50 text-primary': isActive,
            })}
        >
            <div className="flex items-center gap-2">
                <div className="text-[22px]">{route.icon}</div>
                <div className="font-medium"> {mainRoutesInfo[route.path].title}</div>
            </div>
        </div>
    );
}
