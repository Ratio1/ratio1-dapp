import Logo from '@assets/token.svg';
import { mainRoutesInfo, routePath } from '@lib/routes';
import ApiStatusCard from '@shared/ApiStatusCard';
import { NavLink } from 'react-router-dom';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="col bg-lightBlue fixed bottom-0 left-0 top-0 h-full w-[256px] justify-between px-6 pb-6 pt-12">
            <div className="col gap-8">
                <div className="center-all">
                    <img src={Logo} alt="Logo" className="h-11" />
                </div>

                <Navigation />
            </div>

            <div className="col gap-6 pb-2 text-center">
                <ApiStatusCard />

                <NavLink to={routePath.privacyPolicy} className="text-[15px] font-medium leading-none hover:opacity-70">
                    {mainRoutesInfo[routePath.privacyPolicy].title}
                </NavLink>

                <NavLink to={routePath.termsAndConditions} className="text-[15px] font-medium leading-none hover:opacity-70">
                    {mainRoutesInfo[routePath.termsAndConditions].title}
                </NavLink>
            </div>
        </div>
    );
}

export default Sider;
