import Logo from '@assets/logo_blue.svg';
import { RiLayoutLeftLine } from 'react-icons/ri';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <img src={Logo} alt="Logo" className="h-7 pl-0.5" />

                <div className="bg-lightAccent hover:text-bodyHover cursor-pointer rounded-full p-2.5 text-xl transition-all">
                    <RiLayoutLeftLine />
                </div>
            </div>

            <Navigation />
        </div>
    );
}

export default Sider;
