import Logo from '@assets/token.svg';
import { mainRoutesInfo } from '@lib/routes';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FooterMobile from './FooterMobile';
import Wallet from './Wallet';

function Content() {
    const [title, setTitle] = useState<string>();
    const [description, setDescription] = useState<string>();

    const location = useLocation();

    useEffect(() => {
        // Exclude the root route
        if (location.pathname.length > 1) {
            const path = Object.keys(mainRoutesInfo).find((p) => location.pathname.startsWith(p));

            if (path) {
                setTitle(mainRoutesInfo[path]?.title);
                setDescription(mainRoutesInfo[path]?.description);
            }
        }
    }, [location]);

    return (
        <div className="col mx-auto h-full max-w-6xl gap-6 px-4 md:gap-8 md:px-8 lg:gap-12 lg:px-10">
            <div className="flex flex-col-reverse items-center justify-between gap-8 lg:gap-8 larger:flex-row larger:items-start">
                <div className="col gap-2">
                    {!!title && (
                        <div className="row justify-center larger:justify-start">
                            <div className="text-[28px] font-bold leading-none lg:text-[30px] larger:text-[32px]">{title}</div>
                        </div>
                    )}

                    {!!description && (
                        <div className="text-center text-base text-slate-500 lg:text-left lg:text-lg">{description}</div>
                    )}
                </div>

                <div className="row w-full justify-between larger:w-auto">
                    <div className="mobile-only-block">
                        <img src={Logo} alt="Logo" className="h-10" />
                    </div>

                    <Wallet />
                </div>
            </div>

            <Outlet />

            <div className="layoutBreak:hidden">
                <FooterMobile />
            </div>
        </div>
    );
}

export default Content;
