import Favicon from '@assets/favicon.png';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { baseSepolia } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import { addSeconds, differenceInSeconds } from 'date-fns';

// ERC20Mock: 0x97b198628cEBB6d8e743fd0015b4cac92A3B1c08

export const r1ContractAddress = '0xBbcbD433Cc666d0Cd11644B6a3954D7C09C0E060';
export const ndContractAddress = '0x0421b7c9A3B1a4f99F56131b65d15085C7cCACB0';
export const mndContractAddress = '0xB79fb53ABd43427be6995C194a502bC5AC82D512';
export const liquidityManagerContractAddress = '0x11Dcb4Fe7B22fd201bcd3da400134e2bf8083f79';
export const safeAddress = '0xE37562D1Da0F8447bD3cf476906774Cb68501189';

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

export const genesisDate = new Date('2025-01-28T20:00:00.000Z');
export const epochDurationInSeconds = 3600; // 1 hour

export const getCurrentEpoch = (): number => Math.floor(differenceInSeconds(new Date(), genesisDate) / epochDurationInSeconds);
export const getNextEpochTimestamp = (): Date => addSeconds(genesisDate, (getCurrentEpoch() + 1) * epochDurationInSeconds);

export const mndCliffEpochs = 120;
export const gndVestingEpochs = 365;
export const mndVestingEpochs = 900;
export const ndVestingEpochs = 1080;

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

export const ND_LICENSE_CAP = 15_752n * 10n ** 18n;
