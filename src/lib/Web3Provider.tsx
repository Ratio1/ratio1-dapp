import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig, SIWEProvider, SIWEConfig } from 'connectkit';
import { config, projectId } from '@lib/config';
import { generateNonce, SiweMessage } from 'siwe';
import { accessAuth } from '@lib/api/backend';
import { EthAddress } from '@typedefs/blockchain';

const verifyMessage = async ({ message, signature }: { message: string; signature: string }) => {
    try {
        const siweMessage = new SiweMessage(message);
        console.log({ siweMessage });
        const chainId = siweMessage.chainId;
        const address = siweMessage.address;
        if (address === config.safeAddress) {
            localStorage.setItem('chainId', chainId.toString());
            localStorage.setItem('address', address);
            localStorage.setItem('accessToken', 'safe');
            return true;
        }
        const response = await accessAuth({ message, signature });
        localStorage.setItem('chainId', chainId.toString());
        localStorage.setItem('address', address);
        localStorage.setItem('accessToken', response.accessToken);

        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('expiration', response.expiration.toString());
        return true;
    } catch (error) {
        return false;
    }
};

const siweConfig: SIWEConfig = {
    enabled: true,
    getNonce: async () => {
        const nonce = generateNonce();
        return nonce;
    },
    createMessage: ({ nonce, address, chainId }) =>
        new SiweMessage({
            version: '1',
            domain: window.location.host,
            uri: window.location.origin,
            address,
            chainId,
            nonce,
            statement: 'Sign in With Ethereum.',
        }).prepareMessage(),
    verifyMessage,
    getSession: async () => {
        const accessToken = localStorage.getItem('accessToken');
        const expiration = localStorage.getItem('expiration');
        const chainId = localStorage.getItem('chainId');
        const address = localStorage.getItem('address') as EthAddress;

        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (chainId && address && accessToken && expiration && parseInt(expiration) > currentTimestamp) {
            return { chainId: parseInt(chainId), address };
        }

        return null;
    },
    signOut: async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('chainId');
        localStorage.removeItem('address');

        return true;
    },
    signOutOnAccountChange: true,
    signOutOnNetworkChange: true,
    signOutOnDisconnect: true,
    /*
    onSignOut() {
        // Called after sign-out
        setAuthenticated(false);
    },
    onSignIn() {
        // Called afer sign-in
        setAuthenticated(true);
    },
    */
};

const wagmiConfig = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: config.networks,
        transports: {
            [base.id]: http('https://base-mainnet.public.blastapi.io'),
            [baseSepolia.id]: http('https://base-sepolia.gateway.tenderly.co'),
        },

        // Required API Keys
        walletConnectProjectId: projectId,

        // Required App Info
        appName: 'Your App Name',

        // Optional App Info
        appDescription: 'Your App Description',
        appUrl: 'https://family.co', // your app's url
        appIcon: 'https://family.co/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
    }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <SIWEProvider {...siweConfig}>
                    <ConnectKitProvider>{children}</ConnectKitProvider>
                </SIWEProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
