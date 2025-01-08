import { NextUIProvider } from '@nextui-org/system';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createSIWEConfig, formatMessage, SIWECreateMessageArgs, SIWEVerifyMessageArgs } from '@reown/appkit-siwe';
import { arbitrum, mainnet, sepolia } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { AuthenticationProvider } from './authentication';

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

async function getSession() {
    console.log('getSession');

    return null;

    // Return if successful
    // return {
    //     chainId: 1,
    //     address: '0x58fFB0F89e50DcC25Bc208757a63dDA06d30433A',
    // };
}

const verifyMessage = async ({ message, signature }: SIWEVerifyMessageArgs) => {
    console.log('verifyMessage', message, signature);
    return true;
};

const siweConfig = createSIWEConfig({
    signOutOnAccountChange: true,
    signOutOnNetworkChange: true,
    signOutOnDisconnect: true,
    getMessageParams: async () => ({
        domain: window.location.host,
        uri: window.location.origin,
        chains: [1, 42161, 11155111],
        statement: 'Please sign with your account',
        iat: new Date().toISOString(),
    }),
    createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
    getNonce: async () => {
        const nonce = 'NONCE';
        if (!nonce) {
            throw new Error('Failed to get nonce.');
        }
        return nonce;
    },
    getSession,
    verifyMessage,
    signOut: async () => {
        return true;
    },
    onSignOut() {
        console.log('onSignOut');
    },
    onSignIn() {
        console.log('onSignIn');
    },
});

createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [arbitrum, sepolia, mainnet],
    defaultNetwork: mainnet,
    metadata,
    features: {
        analytics: true,
    },
    siweConfig,
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
