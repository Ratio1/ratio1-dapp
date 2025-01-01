import Logo from '@assets/logo_blue.svg';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="flex flex-col gap-9">
            <div className="flex pl-0.5">
                <img src={Logo} alt="Logo" className="h-6" />
            </div>

            <Navigation />
        </div>
    );
}

export default Sider;
