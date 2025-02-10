import { environment } from '@lib/config';
import { ParentRoute, routes, SimpleRoute } from '@lib/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

const mobileRoutes: Array<SimpleRoute | ParentRoute> = routes.slice(0, environment === 'testnet' ? 5 : 4);
const mobileTitles = ['Home', 'Licenses', 'Search', 'Profile', 'Faucet'];

export default function MobileTabs() {
    const location = useLocation();

    return (
        <div className="center-all fixed bottom-0 left-0 right-0 z-40">
            <div className="center-all w-full gap-2 border-t-2 border-slate-200 bg-slate-100 px-2.5 py-2">
                {mobileRoutes.map((route, index) => (
                    <div key={route.path}>
                        <Link
                            to={route.path}
                            className={clsx('center-all col cursor-pointer gap-1 py-1 text-slate-500 hover:opacity-70', {
                                '!text-primary': location.pathname.includes(route.path),
                                'min-w-[64px]': environment === 'testnet',
                                'min-w-[84px]': environment !== 'testnet',
                            })}
                        >
                            <div className="text-[26px]">{route.icon}</div>
                            <div className="text-sm font-semibold">{mobileTitles[index]}</div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
