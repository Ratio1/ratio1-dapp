import { domains, environment } from '@lib/config';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Content from './Content';
import MobileTabs from './Mobile/MobileTabs';
import Sider from './Sider';

function Layout() {
    // Init
    useEffect(() => {
        if (toast) {
            setTimeout(() => {
                if (window.innerWidth < 768) {
                    console.log('Displaying phishing toast on mobile...');

                    toast(
                        (_t) => (
                            <div className="-mx-1 text-sm text-slate-500">
                                Always confirm you're visiting
                                <br />
                                <span className="font-medium text-primary">{`https://${domains[environment]}`}</span> to avoid
                                scams.
                            </div>
                        ),
                        {
                            position: 'top-center',
                            duration: 6000,
                            style: {
                                maxWidth: '98vw',
                            },
                        },
                    );
                } else {
                    console.log('Displaying phishing toast on desktop...');

                    toast(
                        (_t) => (
                            <div className="-mx-1 text-sm text-slate-500">
                                Always confirm you're visiting{' '}
                                <span className="font-medium text-primary">{`https://${domains[environment]}`}</span> to avoid
                                scams.
                            </div>
                        ),
                        {
                            position: 'bottom-center',
                            duration: 6000,
                            style: {
                                minWidth: '416px',
                                maxWidth: '98vw',
                            },
                        },
                    );
                }
            }, 750);
        }
    }, [toast]);

    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd]">
            <div className="hidden lg:block">
                <Sider />
            </div>

            <div className="relative mb-[76px] min-h-dvh w-full py-6 md:py-10 lg:mb-0 lg:ml-sider-with-padding lg:py-12">
                <Content />
            </div>

            <div className="block lg:hidden">
                <MobileTabs />
            </div>
        </div>
    );
}

export default Layout;
