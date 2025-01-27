import Content from './Content';
import MobileTabs from './Mobile/MobileTabs';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd] font-mona">
            <div className="layoutBreak:block hidden">
                <Sider />
            </div>

            <div className="layoutBreak:ml-[256px] layoutBreak:py-10 layoutBreak:mb-0 relative mb-[76px] min-h-dvh w-full py-6 lg:py-12">
                <Content />
            </div>

            <div className="layoutBreak:hidden block">
                <MobileTabs />
            </div>
        </div>
    );
}

export default Layout;
