import { NextUIProvider } from '@nextui-org/system';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrum, mainnet, sepolia } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { AuthenticationProvider } from './authentication';

// const wagmiConfig = createConfig({
//     chains: [arbitrum, sepolia],
//     transports: {
//         [arbitrum.id]: http(),
//         [sepolia.id]: http(),
//     },
// });

const queryClient = new QueryClient();

const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

const metadata = {
    name: 'Ratio1',
    description: 'Ratio1',
    url: 'https://example.com', // Origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

const wagmiAdapter = new WagmiAdapter({
    networks: [arbitrum, sepolia, mainnet],
    projectId,
    ssr: false,
});

createAppKit({
    adapters: [wagmiAdapter],
    networks: [arbitrum, sepolia, mainnet],
    projectId,
    metadata,
    features: {
        analytics: false,
    },
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
                    </NextUIProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </BrowserRouter>
    );
}
