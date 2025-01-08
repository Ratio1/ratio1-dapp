import { NextUIProvider } from '@nextui-org/system';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { AuthenticationProvider } from './authentication';
import { queryClient, wagmiAdapter } from './config';

export function Wrappers({ children }: { children: React.ReactNode }) {
    return (
        <BrowserRouter>
            <WagmiProvider config={wagmiAdapter.wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    <NextUIProvider>
                        <AuthenticationProvider>{children}</AuthenticationProvider>
                    </NextUIProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </BrowserRouter>
    );
}
