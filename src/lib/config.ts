import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SIWECreateMessageArgs, SIWEVerifyMessageArgs, createSIWEConfig, formatMessage } from '@reown/appkit-siwe';
import { arbitrum, mainnet, sepolia } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const genesisDate = new Date('2025-01-01');

export const metadata = {
    name: 'Ratio1',
    description: 'Ratio1',
    url: 'https://example.com', // Origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

export const wagmiAdapter = new WagmiAdapter({
    networks: [arbitrum, sepolia, mainnet],
    projectId,
    ssr: false,
});

async function getSession() {
    console.log('getSession');
    return null;
}

const verifyMessage = async ({ message, signature }: SIWEVerifyMessageArgs) => {
    console.log('verifyMessage', message, signature);
    return true;
};

export const siweConfig = createSIWEConfig({
    signOutOnAccountChange: true,
    signOutOnNetworkChange: true,
    signOutOnDisconnect: true,
    getMessageParams: async () => ({
        domain: window.location.host,
        uri: window.location.origin,
        chains: [1, 42161, 11155111],
        statement: 'Please sign with your account.',
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
