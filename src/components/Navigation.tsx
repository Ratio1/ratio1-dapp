import { childRouteTitles, isParentRoute, mainRoutesInfo, ParentRoute, routes, SimpleRoute } from '@lib/routes';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
    return (
        <div className="flex w-full flex-col gap-3">
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
                    'bg-primary-50 text-primary': location.pathname.includes(route.path),
                })}
                onClick={() => navigate(route.path)}
            >
                <div className="flex items-center gap-3">
                    <div className="text-[22px]">{route.icon}</div>
                    <div className="font-medium"> {mainRoutesInfo[route.path].title}</div>
                </div>
            </div>

            {isParentRoute(route) && (
                <div className="ml-7 flex flex-col border-l-2 border-gray-200 pl-5">
                    {route.children.map((child) => (
                        <div
                            key={child.path}
                            className={clsx('cursor-pointer py-1 font-medium transition-all hover:opacity-70', {
                                'text-primary hover:!opacity-100':
                                    location.pathname.includes(route.path) && location.pathname.includes(child.path),
                            })}
                            onClick={() => navigate(`${route.path}/${child.path}`)}
                        >
                            {childRouteTitles[child.path]}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
