import { AppRoute, getNavigationRoutes, isExternalRoute, isParentRoute, routeInfo } from '@lib/routes/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
    return (
        <div className="flex w-full flex-col gap-2">
            {getNavigationRoutes().map((route, index) => (
                <div key={index}>
                    <Route route={route} />
                </div>
            ))}
        </div>
    );
}

function Route({ route }: { route: AppRoute }) {
    const location = useLocation();

    return (
        <div className="col gap-1">
            <Link
                to={isExternalRoute(route) ? route.externalLink : route.path}
                className={clsx('min-w-40 cursor-pointer rounded-lg px-3 py-2.5 text-body transition-all hover:bg-[#dbecff]', {
                    'bg-[#dbecff] !text-primary': location.pathname.includes(route.path),
                })}
                target={isExternalRoute(route) ? '_blank' : undefined}
            >
                <div className="row gap-2.5">
                    <div className="text-[22px]">{route.icon}</div>
                    <div className="text-[15px] font-medium">{routeInfo[route.path].title}</div>
                </div>
            </Link>

            {isParentRoute(route) && (
                <div className="ml-[22.5px] flex flex-col border-l-2 border-gray-200 pl-5">
                    {route.children.map((child) => (
                        <Link
                            key={child.path}
                            to={`${route.path}/${child.path}`}
                            className={clsx(
                                'cursor-pointer py-1 text-[15px] font-medium text-slate-700 transition-all hover:opacity-60',
                                {
                                    '!text-primary hover:!opacity-100':
                                        location.pathname.includes(route.path) && location.pathname.includes(child.path),
                                },
                            )}
                        >
                            {routeInfo[`${route.path}/${child.path}`]?.title}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Navigation;
