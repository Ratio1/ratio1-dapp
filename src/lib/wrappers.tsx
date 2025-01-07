import { NextUIProvider } from '@nextui-org/system';
import { getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { http, WagmiProvider } from 'wagmi';
import { arbitrum, sepolia } from 'wagmi/chains';
import { AuthenticationProvider } from './authentication';

// const wagmiConfig = createConfig({
//     chains: [arbitrum, sepolia],
//     transports: {
//         [arbitrum.id]: http(),
//         [sepolia.id]: http(),
//     },
// });

const config = getDefaultConfig({
    appName: 'Ratio1',
    projectId: '6fb791d3d18d57d28ae7677e4cff8c6e',
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
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider
                        theme={lightTheme({
                            accentColor: '#1b47f7',
                        })}
                    >
                        <NextUIProvider>
                            <AuthenticationProvider>{children}</AuthenticationProvider>
                        </NextUIProvider>
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </BrowserRouter>
    );
}
