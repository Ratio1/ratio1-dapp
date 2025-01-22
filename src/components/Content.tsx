import { mainRoutesInfo } from '@lib/routes';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Wallet from './Wallet';

function Content() {
    const [title, setTitle] = useState<string>();
    const [description, setDescription] = useState<string>();

    const location = useLocation();

    useEffect(() => {
        // Exclude the root route
        if (location.pathname.length > 1) {
            const path = Object.keys(mainRoutesInfo).find((p) => location.pathname.startsWith(p));

            if (path) {
                setTitle(mainRoutesInfo[path]?.title);
                setDescription(mainRoutesInfo[path]?.description);
            }
        }
    }, [location]);

    return (
        <div className="mx-auto flex h-full max-w-6xl flex-col gap-12 px-10">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    {!!title && (
                        <div className="row h-[40.8px]">
                            <div className="text-[36px] font-bold leading-9">{title}</div>
                        </div>
                    )}

                    {!!description && <div className="text-lg leading-5 text-slate-500">{description}</div>}
                </div>

                <Wallet />
            </div>

            <Outlet />
        </div>
    );
}

export default Content;
