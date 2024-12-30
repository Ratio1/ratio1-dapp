import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

function Layout() {
    return (
        <div className="layout center-all min-h-dvh font-mona">
            <div className="flex min-h-dvh flex-1 border-r border-gray-200 px-10 py-48">
                <Navigation />
            </div>

            <div className="flex-3 min-h-dvh px-10 py-48">
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;
