import { mainRoutesInfo, ParentRoute, routes, SimpleRoute } from '@lib/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
    return (
        <div className="flex w-full flex-col gap-2">
            {routes
                .filter((route) => !!route.icon)
                .map((route, index) => (
                    <div key={index}>
                        <Route route={route} />
                    </div>
                ))}
        </div>
    );
}

function Route({ route }: { route: SimpleRoute | ParentRoute }) {
    const location = useLocation();

    return (
        <div className="flex flex-col gap-2">
            <Link
                to={route.path}
                className={clsx('min-w-40 cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-[#e2eefb]', {
                    'bg-[#e2eefb] text-primary': location.pathname.includes(route.path),
                })}
            >
                <div className="flex items-center gap-2.5">
                    <div className="text-[22px]">{route.icon}</div>
                    <div className="text-[15px] font-medium"> {mainRoutesInfo[route.path].title}</div>
                </div>
            </Link>
        </div>
    );
}
