import Content from './Content';
import MobileTabs from './Mobile/MobileTabs';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd]">
            <div className="hidden lg:block">
                <Sider />
            </div>

            <div className="relative mb-[76px] min-h-dvh w-full py-6 md:py-10 lg:mb-0 lg:ml-sider-with-padding lg:py-12">
                <Content />
            </div>

            <div className="block lg:hidden">
                <MobileTabs />
            </div>
        </div>
    );
}

export default Layout;
