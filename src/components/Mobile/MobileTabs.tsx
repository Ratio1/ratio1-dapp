import { ParentRoute, routes, SimpleRoute } from '@lib/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

const mobileRoutes: Array<SimpleRoute | ParentRoute> = routes.slice(0, 4);

export default function MobileTabs() {
    const location = useLocation();

    return (
        <div className="center-all fixed bottom-0 left-0 right-0 z-40">
            <div className="row mb-6 justify-around gap-4 rounded-full bg-body px-2.5 py-2.5">
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
            </div>
        </div>
    );
}
