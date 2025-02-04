import Favicon from '@assets/favicon.png';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { baseSepolia } from '@reown/appkit/networks';
import { addSeconds, differenceInSeconds } from 'date-fns';

// ERC20Mock: 0x97b198628cEBB6d8e743fd0015b4cac92A3B1c08

export const r1ContractAddress = '0x4De05A4705aCd59da041DC70cF989F8111DD414b';
export const ndContractAddress = '0x2B72b240E74735aF3a731AeD09532320D34b4679';
export const mndContractAddress = '0x57e5C5409E748807d0ca8a860eCe3F2aCBCcC9B0';
export const liquidityManagerContractAddress = '0x11Dcb4Fe7B22fd201bcd3da400134e2bf8083f79';
export const safeAddress = '0x9e7E5655db30E63edfcE83A227571377b07988F1';

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

export const genesisDate = new Date('2025-02-04T12:00:00.000Z');
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

export const ND_LICENSE_CAP = 1575_188843457943924200n;
