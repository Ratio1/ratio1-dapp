import Favicon from '@assets/favicon.png';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { baseSepolia } from '@reown/appkit/networks';
import { addSeconds } from 'date-fns';
import { getCurrentEpoch } from './utils';

export const r1ContractAddress = '0xCA32aD806BB1e086D77c733656c20334bf2976D6';
export const ndContractAddress = '0x9aB4e425c7dFFC7Aa1A7a262727b0b663e047571';
export const mndContractAddress = '0x658bE7d73EBd0Ba7DCe26c112d9871B7Bed890EC';
export const liquidityManagerContractAddress = '0x7ecC3d8519f068D730EEDeCe899C4CdEC7A4E6A1';
export const safeAddress = '0xAEEa4E234096b1AcC16c898B6E057Fb0e33F9cC2';

export const getContractAddress = (type: 'ND' | 'MND' | 'GND') => {
    switch (type) {
        case 'ND':
            return ndContractAddress;

        default:
            return mndContractAddress;
    }
};

export const explorerUrl = 'https://sepolia.basescan.org';

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const genesisDate = new Date('2025-02-05T17:00:00.000Z');
export const epochDurationInSeconds = 3600; // 1 hour

// export const getCurrentEpoch = (): number => Math.floor(differenceInSeconds(new Date(), genesisDate) / epochDurationInSeconds);
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

export const ND_LICENSE_CAP = 1575_188843457943924200n;
