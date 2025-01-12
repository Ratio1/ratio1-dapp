import Content from './Content';
import Sider from './Sider';

function Layout() {
    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd] font-mona">
            <div className="min-w-[282px] bg-lightAccent px-8 py-12">
                <Sider />
            </div>

            <div className="relative min-h-dvh w-full py-12">
                <Content />
            </div>
        </div>
    );
}

export default Layout;
