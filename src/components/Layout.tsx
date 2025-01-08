import Content from './Content';
import Sider from './Sider';
import Wallet from './Wallet';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch font-mona">
            <div className="bg-lightAccent px-10 py-10">
                <Sider />
            </div>

            <div className="relative min-h-dvh w-full py-10">
                <div className="absolute right-0 top-0 m-10">
                    <Wallet />
                </div>

                <Content />
            </div>
        </div>
    );
}

export default Layout;
