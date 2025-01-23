import Content from './Content';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd] font-mona">
            <div className="web-only-block">
                <Sider />
            </div>

            <div className="relative min-h-dvh w-full py-6 md:ml-[256px] md:py-10 lg:py-12">
                <Content />
            </div>
        </div>
    );
}

export default Layout;
