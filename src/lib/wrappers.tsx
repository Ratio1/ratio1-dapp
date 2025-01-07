import { NextUIProvider } from '@nextui-org/system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { arbitrum, sepolia } from 'wagmi/chains';
import { AuthenticationProvider } from './authentication';

const wagmiConfig = createConfig({
    chains: [arbitrum, sepolia],
    transports: {
        [arbitrum.id]: http(),
        [sepolia.id]: http(),
    },
});

const queryClient = new QueryClient();

export function Wrappers({ children }: { children: React.ReactNode }) {
    return (
        <BrowserRouter>
            <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    <NextUIProvider>
                        <AuthenticationProvider>{children}</AuthenticationProvider>
                    </NextUIProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </BrowserRouter>
    );
}
