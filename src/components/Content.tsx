import { routeTitles } from '@lib/routes';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/breadcrumbs';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function Content() {
    const [rootRoute, setRootRoute] = useState<string>();

    const location = useLocation();

    useEffect(() => {
        setRootRoute(routeTitles[location.pathname]);
    }, [location]);

    return (
        <div className="flex flex-col gap-10">
            <Breadcrumbs
                classNames={{
                    list: 'bg-lightAccent',
                }}
                itemClasses={{
                    separator: 'px-2',
                }}
                separator="/"
                size="lg"
                radius="sm"
                variant="solid"
            >
                <BreadcrumbItem>{rootRoute}</BreadcrumbItem>
                <BreadcrumbItem>Placeholder</BreadcrumbItem>
            </Breadcrumbs>

            <Outlet />
        </div>
    );
}

export default Content;
