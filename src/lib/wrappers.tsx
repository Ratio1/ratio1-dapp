import { NextUIProvider } from '@nextui-org/system';
import { getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { arbitrum, sepolia } from 'wagmi/chains';

const wagmiConfig = createConfig({
    chains: [arbitrum, sepolia],
    transports: {
        [arbitrum.id]: http(),
        [sepolia.id]: http(),
    },
});

const rainbowConfig = getDefaultConfig({
    appName: 'Ratio1',
    projectId: '6fb791d3d18d57d28ae7677e4cff8c6e',
    chains: [arbitrum, sepolia],
    ssr: false,
});

const queryClient = new QueryClient();

export function Wrappers({ children }: { children: React.ReactNode }) {
    return (
        <BrowserRouter>
            <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider
                        theme={lightTheme({
                            accentColor: '#1b47f7',
                        })}
                    >
                        <NextUIProvider>{children}</NextUIProvider>
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </BrowserRouter>
    );
}
