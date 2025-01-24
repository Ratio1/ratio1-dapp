import Favicon from '@assets/favicon.png';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
    SIWECreateMessageArgs,
    SIWEVerifyMessageArgs,
    createSIWEConfig,
    formatMessage,
    getAddressFromMessage,
    getChainIdFromMessage,
} from '@reown/appkit-siwe';
import { baseSepolia } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

export const contractAddress = '0x799319c30eCdA0fA9E678FbA217047f03E92527F';

export const ndContractAddress = '0xdF58793EB6c8862d81B76810239652f0aAEEDbF8';
export const mndContractAddress = '0xc2F47468Fd614b63dCe00205153748aE801114f2';
export const explorerUrl = 'https://sepolia.etherscan.io';

export const backendUrl = 'https://ratio1-backend.ngrok.app';
export const oraclesUrl = 'https://naeural-oracle.ngrok.app';
//export const backendUrl = 'http://192.168.1.101:3001';

export const queryClient = new QueryClient();

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const genesisDate = new Date('2025-01-01T00:00:00.000Z');
export const r1Price = 12.5; // in $USD

export const metadata = {
    name: 'Ratio1',
    description:
        'Experience the power of Ratio1 AI OS, built on Ratio1 Protocol and powered by blockchain, democratizing AI to empower limitless innovation.',
    url: 'https://app.ratio1.ai',
    icons: [Favicon],
};

export const wagmiAdapter = new WagmiAdapter({
    networks: [baseSepolia],
    projectId,
    ssr: false,
});

export const getCurrentEpoch = () => {
    const startEpochTimestamp = 1737676800; // 2022-09-01T00:00:00Z
    const epochDuration = 3600; // 1 hour

    return Math.floor((Date.now() / 1000 - startEpochTimestamp) / epochDuration);
};

async function getSession() {
    const accessToken = localStorage.getItem('accessToken');
    const chainId = localStorage.getItem('chainId');
    const address = localStorage.getItem('address');
    if (accessToken && chainId && address) {
        return { chainId: parseInt(chainId), address };
    }
    return null;
}

//TODO handle properly
const verifyMessage = async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
        const response = (await fetch(backendUrl + '/auth/access', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, signature }),
        }).then((res) => res.json())) as {
            data: {
                accessToken: string;
                refreshToken: string;
                expiration: number;
            };
            error: string;
        };
        localStorage.setItem('accessToken', response.data.accessToken);
        const chainId = getChainIdFromMessage(message);
        const address = getAddressFromMessage(message);
        localStorage.setItem('chainId', chainId.replace('eip155:', ''));
        localStorage.setItem('address', address);
        return response.error === '';
    } catch (error) {
        return false;
    }
};

export const siweConfig = createSIWEConfig({
    signOutOnAccountChange: true,
    signOutOnNetworkChange: true,
    signOutOnDisconnect: true,
    getMessageParams: async () => ({
        domain: window.location.host,
        uri: window.location.origin,
        chains: [84532],
        statement: 'Please sign with your account.',
        iat: new Date().toISOString(),
    }),
    createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
    getNonce: async () => {
        const nonce = 'ZHa67TjiuP3NwIJ9Y';
        return nonce;
    },
    getSession,
    verifyMessage,
    signOut: async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('chainId');
        localStorage.removeItem('address');
        return true;
    },
    onSignOut() {
        // Called after sign-out
    },
    onSignIn() {
        // Called afer sign-in
    },
});

export const LICENSE_CAP = 25000;
