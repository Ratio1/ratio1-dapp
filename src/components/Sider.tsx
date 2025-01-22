import Logo from '@assets/token.svg';
import { routePath } from '@lib/routes';
import clsx from 'clsx';
import { RiFileList3Line } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import Navigation from './Navigation';

function Sider() {
    const location = useLocation();

    return (
        <div className="col fixed bottom-0 left-0 top-0 h-full w-[256px] justify-between bg-lightAccent px-6 pb-6 pt-12">
            <div className="col gap-8">
                <div className="center-all">
                    <img src={Logo} alt="Logo" className="h-11" />
                </div>

                <Navigation />
            </div>

            <div className="col gap-2.5">
                <div className="center-all">
                    <Link to={routePath.privacyPolicy}>
                        <div
                            className={clsx(
                                'cursor-pointer rounded-lg bg-[#e8ebf6] px-3.5 py-2.5 transition-all hover:bg-[#e2eefb]',
                                {
                                    'bg-[#e2eefb] text-primary': location.pathname.includes(routePath.privacyPolicy),
                                },
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="text-[22px]">
                                    <RiFileList3Line />
                                </div>
                                <div className="text-[15px] font-medium">Privacy Policy</div>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="center-all">
                    <Link to={routePath.termsAndConditions}>
                        <div
                            className={clsx(
                                'cursor-pointer rounded-lg bg-[#e8ebf6] px-3.5 py-2.5 transition-all hover:bg-[#e2eefb]',
                                {
                                    'bg-[#e2eefb] text-primary': location.pathname.includes(routePath.termsAndConditions),
                                },
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="text-[22px]">
                                    <RiFileList3Line />
                                </div>
                                <div className="text-[15px] font-medium">Terms & Conditions</div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Sider;
