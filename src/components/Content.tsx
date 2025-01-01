import { mainRoutesInfo } from '@lib/routes';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function Content() {
    const [title, setTitle] = useState<string>();
    const [description, setDescription] = useState<string>();

    const location = useLocation();

    useEffect(() => {
        // Exclude the root route
        if (location.pathname.length > 1) {
            const path = Object.keys(mainRoutesInfo).find((p) => location.pathname.startsWith(p));

            if (path) {
                setTitle(mainRoutesInfo[path].title);
                setDescription(mainRoutesInfo[path].description);
            }
        }
    }, [location]);

    return (
        <div className="mx-auto flex flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-2">
                <div className="text-[38px] font-bold text-black">{title}</div>
                <div className="text-bodyLight text-[20px]">{description}</div>
            </div>

            <Outlet />
        </div>
    );
}

export default Content;
