import { routeTitles } from '@lib/routes';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function Content() {
    const [currentRoute, setCurrentRoute] = useState<string>();

    const location = useLocation();

    useEffect(() => {
        setCurrentRoute(routeTitles[location.pathname]);
    }, [location]);

    return (
        <div className="flex flex-col gap-10">
            <div className="text-4xl font-bold text-black">{currentRoute}</div>

            <Outlet />
        </div>
    );
}

export default Content;
