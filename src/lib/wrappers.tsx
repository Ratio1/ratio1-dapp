import ScrollToTop from '@components/ScrollToTop';
import { queryClient, wagmiAdapter } from '@lib/config';
import { NextUIProvider } from '@nextui-org/system';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { AuthenticationProvider } from './contexts/authentication';
import { BlockchainProvider } from './contexts/blockchain';

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
