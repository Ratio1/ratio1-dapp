import { getNavigationRoutes, mainRoutesInfo } from '@lib/routes/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

function MobileTabs() {
    const location = useLocation();

    return (
        <div className="center-all fixed bottom-0 left-0 right-0 z-40">
            <div className="w-full gap-2 border-t-2 border-slate-200 bg-slate-100 px-2.5 py-2">
                <div className="center-all nav-safe-padding gap-2">
                    {getNavigationRoutes().map((route) => (
                        <div key={route.path}>
                            <Link
                                to={route.path}
                                className={clsx(
                                    'center-all col min-w-[64px] cursor-pointer gap-1 py-1 text-slate-500 hover:opacity-70',
                                    {
                                        '!text-primary': location.pathname.includes(route.path),
                                    },
                                )}
                            >
                                <div className="text-[26px]">{route.icon}</div>
                                <div className="text-sm font-semibold">
                                    {mainRoutesInfo[route.path].mobileTitle || mainRoutesInfo[route.path].title}
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
