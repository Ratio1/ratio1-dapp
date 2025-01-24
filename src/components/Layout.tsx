import Content from './Content';
import MobileTabs from './Mobile/MobileTabs';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd] font-mona">
            <div className="web-only-block">
                <Sider />
            </div>

            <div className="relative mb-[76px] min-h-dvh w-full py-6 md:ml-[256px] md:py-10 lg:mb-0 lg:py-12">
                <Content />
            </div>

            <div className="mobile-only-block">
                <MobileTabs />
            </div>
        </div>
    );
}

export default Layout;
