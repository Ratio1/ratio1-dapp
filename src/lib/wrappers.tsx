import ScrollToTop from '@components/ScrollToTop';
import { NextUIProvider } from '@nextui-org/system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { AuthenticationProvider } from './contexts/authentication';
import { BlockchainProvider } from './contexts/blockchain';
import { Web3Provider } from './Web3Provider';

export function Wrappers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <BrowserRouter>
            <Web3Provider>
                {/*<WagmiProvider config={wagmiAdapter.wagmiConfig}>*/}
                <QueryClientProvider client={queryClient}>
                    <NextUIProvider>
                        <AuthenticationProvider>
                            <BlockchainProvider>{children}</BlockchainProvider>
                        </AuthenticationProvider>

                        <Toaster
                            containerStyle={{
                                top: 30,
                                left: 30,
                                bottom: 30,
                                right: 30,
                            }}
                            toastOptions={{
                                className: 'font-mona text-base',
                            }}
                        />

                        <ScrollToTop />
                    </NextUIProvider>
                </QueryClientProvider>
            </Web3Provider>
        </BrowserRouter>
    );
}
