import Logo from '@assets/token.svg';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="flex flex-col gap-8">
            <div className="center-all">
                <img src={Logo} alt="Logo" className="h-11" />
            </div>

            <Navigation />
        </div>
    );
}

export default Sider;
