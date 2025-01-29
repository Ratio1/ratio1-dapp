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
import { accessAuth } from './api/backend';
import { safe } from 'wagmi/connectors';

export const contractAddress = '0x799319c30eCdA0fA9E678FbA217047f03E92527F';

export const r1ContractAddress = '0x6764E348ad3190DC90f6767C4BF38D7479a77981';
export const ndContractAddress = '0xdF58793EB6c8862d81B76810239652f0aAEEDbF8';
export const mndContractAddress = '0xc2F47468Fd614b63dCe00205153748aE801114f2';

export const getContractAddress = (type: 'ND' | 'MND' | 'GND') => {
    switch (type) {
        case 'ND':
            return ndContractAddress;

        default:
            return mndContractAddress;
    }
};

export const explorerUrl = 'https://sepolia.basescan.org';

export const queryClient = new QueryClient();

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const genesisDate = new Date('2025-01-24T00:00:00.000Z');
export const epochDurationInSeconds = 3600; // 1 hour
export const mndCliffEpochs = 120;
export const gndVestingEpochs = 1825;
export const mndVestingEpochs = 1825;
export const ndVestingEpochs = 1800;
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
    connectors: [safe()],
});

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
        const response = await accessAuth({ message, signature });
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('expiration', response.expiration.toString());
        const chainId = getChainIdFromMessage(message);
        const address = getAddressFromMessage(message);
        localStorage.setItem('chainId', chainId.replace('eip155:', ''));
        localStorage.setItem('address', address);
        return true;
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
        chains: [baseSepolia.id],
        statement: 'Please sign with your account.',
        iat: new Date().toISOString(),
    }),
    createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
    getNonce: async () => {
        const nonce = 'ZHa67TjiuP3NwIJ9Y'; //TODO nonce generation
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

export const ND_LICENSE_CAP = 15_752n * 10n ** 18n;
