import ScrollToTop from '@components/ScrollToTop';
import { metadata, projectId, queryClient, siweConfig, wagmiAdapter } from '@lib/config';
import { NextUIProvider } from '@nextui-org/system';
import { baseSepolia, mainnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { AuthenticationProvider } from './authentication';
import { BlockchainProvider } from './blockchain';

createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [baseSepolia],
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
    enableWalletConnect: true,
    allWallets: 'HIDE',
    termsConditionsUrl: 'https://ratio1.ai/terms-and-conditions',
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
                        <AuthenticationProvider>
                            <BlockchainProvider>{children}</BlockchainProvider>
                        </AuthenticationProvider>

                        <Toaster
                            position="bottom-right"
                            containerStyle={{
                                top: 30,
                                left: 30,
                                bottom: 30,
                                right: 30,
                            }}
                        />

                        <ScrollToTop />
                    </NextUIProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </BrowserRouter>
    );
}
