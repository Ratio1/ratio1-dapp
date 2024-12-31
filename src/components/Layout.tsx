import Content from './Content';
import Sider from './Sider';

function Layout() {
    return (
        <div className="layout center-all min-h-dvh font-mona">
            <div className="min-h-dvh flex-1 border-r-2 border-gray-300 px-8 py-48">
                <Sider />
            </div>

            <div className="flex-4 min-h-dvh px-8 py-48">
                <Content />
            </div>
        </div>
    );
}

export default Layout;
