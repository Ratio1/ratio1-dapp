import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig, SIWEProvider, SIWEConfig } from 'connectkit';
import { config, projectId } from '@lib/config';
import { generateNonce, SiweMessage } from 'siwe';
import { accessAuth } from '@lib/api/backend';
import { EthAddress } from '@typedefs/blockchain';
import Favicon from '@assets/favicon.png';

const siweConfig: SIWEConfig = {
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
            issuedAt: new Date().toISOString(),
            statement:
                `By confirming this signature and engaging with our platform,` +
                ` you confirm your status as the rightful account manager or authorized representative for the wallet address ${address}. ` +
                `This action grants permission for a login attempt on the https://${window.location.host} portal. ` +
                `Your interaction with our site signifies your acceptance of Ratio1's EULA, Terms of Service, and Privacy Policy, as detailed in our official documentation. ` +
                `You acknowledge having fully reviewed these documents, accessible through our website. ` +
                `We strongly advise familiarizing yourself with these materials to fully understand our data handling practices and your entitlements as a user`,
        }).prepareMessage(),
    verifyMessage: async ({ message, signature }: { message: string; signature: string }) => {
        try {
            const siweMessage = new SiweMessage(message);
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
    },
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
};

const wagmiConfig = createConfig(
    getDefaultConfig({
        chains: config.networks,
        walletConnectProjectId: projectId,
        appName: 'Ratio1',
        appDescription:
            'Experience the power of Ratio1 AI OS, built on Ratio1 Protocol and powered by blockchain, democratizing AI to empower limitless innovation.',
        appUrl: 'https://app.ratio1.ai',
        appIcon: Favicon,
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
