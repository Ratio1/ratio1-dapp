import { metadata, projectId, siweConfig, wagmiAdapter } from '@lib/config';
import { arbitrum, mainnet, sepolia } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { useEffect, useState } from 'react';
import Content from './Content';
import Sider from './Sider';
import Wallet from './Wallet';

function Layout() {
    const [isCreated, setCreated] = useState(false);

    useEffect(() => {
        const appKit = createAppKit({
            adapters: [wagmiAdapter],
            projectId,
            networks: [arbitrum, sepolia, mainnet],
            defaultNetwork: mainnet,
            metadata,
            features: {
                analytics: true,
                swaps: false,
                onramp: false,
                email: false,
                socials: [],
            },
            siweConfig,
            enableWalletConnect: false,
            allWallets: 'HIDE',
            termsConditionsUrl: 'https://www.mytermsandconditions.com',
            themeMode: 'light',
            themeVariables: {
                '--w3m-font-family': 'Mona Sans',
                '--w3m-accent': '#1b47f7',
            },
        });

        console.log('Created App Kit', appKit);

        setTimeout(() => {
            setCreated(true);
        }, 2000);
    }, []);

    if (!isCreated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex min-h-dvh items-stretch font-mona">
            <div className="bg-lightAccent px-10 py-10">
                <Sider />
            </div>

            <div className="relative min-h-dvh w-full py-10">
                <div className="absolute right-0 top-0 m-10">
                    <Wallet />
                </div>

                <Content />
            </div>
        </div>
    );
}

export default Layout;
