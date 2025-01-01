import Content from './Content';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch font-mona">
            <div className="w-56 p-8">
                <Sider />
            </div>

            <div className="min-h-dvh w-full py-10">
                <Content />
            </div>
        </div>
    );
}

export default Layout;
