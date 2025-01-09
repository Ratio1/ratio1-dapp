import { mainRoutesInfo, ParentRoute, routes, SimpleRoute } from '@lib/routes';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
    return (
        <div className="flex w-full flex-col gap-2">
            {routes.map((route, index) => (
                <div key={index}>
                    <Route route={route} />
                </div>
            ))}
        </div>
    );
}

function Route({ route }: { route: SimpleRoute | ParentRoute }) {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-2">
            <div
                className={clsx('min-w-44 cursor-pointer rounded-lg px-4 py-2.5 transition-all hover:bg-primary-50', {
                    'bg-[#e2eefb] text-primary': location.pathname.includes(route.path),
                })}
                onClick={() => navigate(route.path)}
            >
                <div className="flex items-center gap-3">
                    <div className="text-[22px]">{route.icon}</div>
                    <div className="font-medium"> {mainRoutesInfo[route.path].title}</div>
                </div>
            </div>
        </div>
    );
}
