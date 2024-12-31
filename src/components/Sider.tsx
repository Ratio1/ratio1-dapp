import Logo from '@assets/logo_blue.svg';
import { RiLayoutLeftLine } from 'react-icons/ri';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <img src={Logo} alt="Logo" className="h-6 pl-0.5" />

                <div className="text-xl">
                    <RiLayoutLeftLine />
                </div>
            </div>

            <Navigation />
        </div>
    );
}

export default Sider;
