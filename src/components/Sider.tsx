import Logo from '@assets/logo_blue.svg';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="flex flex-col gap-9">
            <div className="center-all">
                <img src={Logo} alt="Logo" className="h-[26px]" />
            </div>

            <Navigation />
        </div>
    );
}

export default Sider;
