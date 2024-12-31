import { AppRoute, routes, routeTitles } from '@lib/routes';
import clsx from 'clsx';
import { map } from 'lodash';
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
            {map(routes, (route, index) => (
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
            className={clsx('bg-lightAccent hover:text-bodyHover cursor-pointer rounded-lg px-4 py-2.5 transition-all', {
                '!bg-darkAccent text-whitesmoke hover:!text-whitesmoke': isActive,
            })}
        >
            <div className="flex items-center gap-2">
                <div className="text-xl">{route.icon}</div>
                <div className="font-medium"> {routeTitles[route.path]}</div>
            </div>
        </div>
    );
}
