import Logo from '@assets/logo_blue.svg';
import { mainRoutesInfo } from '@lib/routes';
import { routePath } from '@lib/routes/route-paths';
import NetworkAndStatus from '@shared/NetworkAndStatus';
import { RiDiscordLine, RiLinkedinBoxLine, RiTwitterXLine, RiYoutubeLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const socialLinks = [
    { url: 'https://discord.gg/ratio1ai', icon: <RiDiscordLine /> },
    { url: 'https://x.com/ratio1ai', icon: <RiTwitterXLine /> },
    { url: 'https://www.linkedin.com/company/ratio1', icon: <RiLinkedinBoxLine /> },
    { url: 'https://www.youtube.com/@ratio1AI', icon: <RiYoutubeLine /> },
];

function FooterMobile() {
    return (
        <div className="col center-all w-full gap-10 rounded-3xl bg-slate-100 px-8 py-12">
            <div className="col gap-4">
                <img src={Logo} alt="Logo" className="h-7" />
                <div className="text-center text-sm font-medium text-slate-500">
                    Ratio1 - The Ultimate AI OS Powered by Blockchain Technology
                </div>
            </div>

            <div className="col">
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

            <NetworkAndStatus />
        </div>
    );
}

export default FooterMobile;
