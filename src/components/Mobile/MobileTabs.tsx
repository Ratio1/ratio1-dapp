import { ParentRoute, routes, SimpleRoute } from '@lib/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

const mobileRoutes: Array<SimpleRoute | ParentRoute> = routes.slice(0, 4);
const mobileTitles = ['Home', 'Licenses', 'Search', 'Profile'];

export default function MobileTabs() {
    const location = useLocation();

    return (
        <div className="center-all fixed bottom-0 left-0 right-0 z-40">
            <div className="row w-full justify-around gap-4 border-t-2 border-slate-200 bg-slate-100 px-2.5 py-2.5">
                {mobileRoutes.map((route, index) => (
                    <div key={route.path}>
                        <Link
                            to={route.path}
                            className={clsx(
                                'center-all col min-w-[84px] cursor-pointer gap-1 py-1 text-slate-500 hover:opacity-70',
                                {
                                    '!text-primary': location.pathname.includes(route.path),
                                },
                            )}
                        >
                            <div className="text-[26px]">{route.icon}</div>
                            <div className="text-sm font-medium">{mobileTitles[index]}</div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* <div className="row w-full justify-around gap-4 border-t-2 border-slate-200 bg-slate-100 px-2.5 py-2.5">
                {mobileRoutes.map((route) => (
                    <div key={route.path}>
                        <Link to={route.path}>
                            <div
                                className={clsx('cursor-pointer p-3.5 text-3xl text-slate-500 hover:opacity-70', {
                                    '!text-primary': location.pathname.includes(route.path),
                                })}
                            >
                                {route.icon}
                            </div>
                        </Link>
                    </div>
                ))}
            </div> */}

            {/* <div className="row mb-2.5 justify-around gap-4 rounded-full bg-body px-2.5 py-2.5">
                {mobileRoutes.map((route) => (
                    <div key={route.path}>
                        <Link to={route.path}>
                            <div
                                className={clsx('cursor-pointer rounded-full p-3.5 text-2xl text-white hover:opacity-70', {
                                    'bg-white !text-body !opacity-100': location.pathname.includes(route.path),
                                })}
                            >
                                {route.icon}
                            </div>
                        </Link>
                    </div>
                ))}
            </div> */}

            {/* <div className="row mb-2.5 justify-around gap-4 rounded-full bg-primary px-2.5 py-2.5">
                {mobileRoutes.map((route) => (
                    <div key={route.path}>
                        <Link to={route.path}>
                            <div
                                className={clsx('cursor-pointer rounded-full p-3.5 text-2xl text-white hover:opacity-70', {
                                    'bg-white !text-primary !opacity-100': location.pathname.includes(route.path),
                                })}
                            >
                                {route.icon}
                            </div>
                        </Link>
                    </div>
                ))}
            </div> */}
        </div>
    );
}
