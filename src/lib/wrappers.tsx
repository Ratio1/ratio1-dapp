import { metadata, projectId, queryClient, siweConfig, wagmiAdapter } from '@lib/config';
import { NextUIProvider } from '@nextui-org/system';
import { arbitrum, mainnet, sepolia } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { AuthenticationProvider } from './authentication';

createAppKit({
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

export function Wrappers({ children }: { children: React.ReactNode }) {
    return (
        <BrowserRouter>
            <WagmiProvider config={wagmiAdapter.wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    <NextUIProvider>
                        <AuthenticationProvider>{children}</AuthenticationProvider>
                        <Toaster
                            position="bottom-right"
                            containerStyle={{
                                top: 40,
                                left: 40,
                                bottom: 40,
                                right: 40,
                            }}
                        />
                    </NextUIProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </BrowserRouter>
    );
}
