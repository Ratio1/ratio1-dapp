import Logo from '@assets/logo_blue.svg';
import { RiLayoutLeftLine } from 'react-icons/ri';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <img src={Logo} alt="Logo" className="invisible h-7 pl-0.5" />

                <div className="cursor-pointer rounded-full bg-lightAccent p-2.5 text-[22px] transition-all hover:text-bodyHover">
                    <RiLayoutLeftLine />
                </div>
            </div>

            <Navigation />
        </div>
    );
}

export default Sider;
