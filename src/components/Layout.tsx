import Content from './Content';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd] font-mona">
            <Sider />

            <div className="relative ml-[256px] min-h-dvh w-full py-12">
                <Content />
            </div>
        </div>
    );
}

export default Layout;
