import Logo from '@assets/logo_blue.svg';
import { ping } from '@lib/api/backend';
import { mainRoutesInfo, routePath } from '@lib/routes';
import { Spinner } from '@nextui-org/spinner';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { RiDiscordLine, RiLinkedinBoxLine, RiTwitterXLine, RiYoutubeLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const socialLinks = [
    { url: 'https://discord.gg/ratio1ai', icon: <RiDiscordLine /> },
    { url: 'https://x.com/ratio1ai', icon: <RiTwitterXLine /> },
    { url: 'https://www.linkedin.com/company/ratio1', icon: <RiLinkedinBoxLine /> },
    { url: 'https://www.youtube.com/@ratio1AI', icon: <RiYoutubeLine /> },
];

function FooterMobile() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['ping'],
        queryFn: ping,
    });

    return (
        <div className="col center-all w-full gap-10 rounded-3xl bg-lightAccent px-8 py-12">
            <div className="col gap-4">
                <img src={Logo} alt="Logo" className="h-7" />
                <div className="text-center text-sm font-medium text-slate-500">
                    Ratio1 - The Ultimate AI OS Powered by Blockchain Technology
                </div>
            </div>

            <div className="col gap-1">
                <div className="text-center font-semibold">Join us</div>
                <div className="row w-full gap-2">
                    {socialLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.url}
                            className="cursor-pointer p-2 text-3xl text-primary hover:opacity-70"
                            target="_blank"
                        >
                            {link.icon}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="col gap-4 text-center text-sm font-semibold">
                <Link to={routePath.termsAndConditions} className="hover:opacity-70">
                    {mainRoutesInfo[routePath.termsAndConditions].title}
                </Link>
                <Link to={routePath.privacyPolicy} className="hover:opacity-70">
                    {mainRoutesInfo[routePath.privacyPolicy].title}
                </Link>
            </div>

            <div className="row mx-auto gap-2 rounded-lg bg-[#e8ebf6] px-3.5 py-2.5">
                <div className="center-all">
                    {isLoading ? (
                        <Spinner size="sm" className="scale-75" />
                    ) : (
                        <div
                            className={clsx('h-2.5 w-2.5 rounded-full', {
                                'bg-green-500': !error,
                                'bg-red-500': data?.status === 'error' || !!error,
                            })}
                        ></div>
                    )}
                </div>

                <div className="text-sm font-medium text-slate-600">API Status</div>
            </div>
        </div>
    );
}

export default FooterMobile;
