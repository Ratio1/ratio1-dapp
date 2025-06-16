import { getMobileNavigationRoutes, isExternalRoute, routeInfo } from '@lib/routes/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

function MobileTabs() {
    const location = useLocation();

    return (
        <div className="center-all fixed bottom-0 left-0 right-0 z-40">
            <div className="w-full gap-2 border-t border-slate-200 bg-slate-100 px-2.5 py-1">
                <div
                    className={clsx('center-all nav-safe-padding', {
                        'gap-1': getMobileNavigationRoutes().length > 4,
                        'gap-3': getMobileNavigationRoutes().length <= 4,
                    })}
                >
                    {getMobileNavigationRoutes().map((route) => (
                        <div key={route.path}>
                            <Link
                                to={isExternalRoute(route) ? route.externalLink : route.path}
                                className={clsx(
                                    'center-all col min-w-[64px] cursor-pointer gap-0.5 px-0.5 py-1 text-slate-500 hover:opacity-70',
                                    {
                                        '!text-primary': location.pathname.includes(route.path),
                                    },
                                )}
                                target={isExternalRoute(route) ? '_blank' : undefined}
                            >
                                <div className="text-2xl">{route.icon}</div>
                                <div className="text-sm font-semibold">
                                    {routeInfo[route.path].mobileTitle || routeInfo[route.path].title}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MobileTabs;
