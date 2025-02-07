import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { AppKitNetwork, base, baseSepolia } from '@reown/appkit/networks';
import { EthAddress } from '@typedefs/blockchain';
import { addSeconds } from 'date-fns';

type Config = {
    backendUrl: string;
    oraclesUrl: string;
    r1ContractAddress: EthAddress;
    ndContractAddress: EthAddress;
    mndContractAddress: EthAddress;
    liquidityManagerContractAddress: EthAddress;
    faucetContractAddress?: EthAddress;
    safeAddress: EthAddress;
    explorerUrl: string;
    genesisDate: Date;
    epochDurationInSeconds: number;
    mndCliffEpochs: number;
    gndVestingEpochs: number;
    mndVestingEpochs: number;
    ndVestingEpochs: number;
    networks: AppKitNetwork[];
    ND_LICENSE_CAP: bigint;
};

const configs: {
    [key in 'mainnet' | 'testnet' | 'devnet']: Config;
} = {
    mainnet: {
        backendUrl: 'https://dapp-api.ratio1.ai',
        oraclesUrl: 'https://oracle-main.ratio1.ai',
        r1ContractAddress: '0xc992DcaB6D3F8783fBf0c935E7bCeB20aa50A6f1',
        ndContractAddress: '0xE20198EE2B76eED916A568a47cdea9681f7c79BF',
        mndContractAddress: '0xfD52a7958088dF734D523d618e583e4d53cD7420',
        liquidityManagerContractAddress: '0xTODO',
        safeAddress: '0x52B56A307469B1f35BC53BF55E53bBf585428Ff4',
        explorerUrl: 'https://basescan.org',
        genesisDate: new Date('2025-02-05T16:00:00.000Z'),
        epochDurationInSeconds: 86400, // 24 hours
        mndCliffEpochs: 120,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [base],
        ND_LICENSE_CAP: 1575_188843457943924200n,
    },
    testnet: {
        backendUrl: 'https://dapp-api.ratio1.ai',
        oraclesUrl: 'https://oracle-main.ratio1.ai',
        r1ContractAddress: '0xCA32aD806BB1e086D77c733656c20334bf2976D6',
        ndContractAddress: '0x9aB4e425c7dFFC7Aa1A7a262727b0b663e047571',
        mndContractAddress: '0x658bE7d73EBd0Ba7DCe26c112d9871B7Bed890EC',
        faucetContractAddress: '0xd9a9B7fd2De5fFAF50695d2f489a56771CA28123',
        liquidityManagerContractAddress: '0x7ecC3d8519f068D730EEDeCe899C4CdEC7A4E6A1',
        safeAddress: '0xAEEa4E234096b1AcC16c898B6E057Fb0e33F9cC2',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-02-05T16:00:00.000Z'),
        epochDurationInSeconds: 86400, // 24 hours
        mndCliffEpochs: 120,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [baseSepolia],
        ND_LICENSE_CAP: 1575_188843457943924200n,
    },
    devnet: {
        //TODO add below settings on devnet genesis
        backendUrl: 'https://ratio1-backend.ngrok.app',
        oraclesUrl: 'https://naeural-oracle.ngrok.app',
        r1ContractAddress: '0xCA32aD806BB1e086D77c733656c20334bf2976D6',
        ndContractAddress: '0x9aB4e425c7dFFC7Aa1A7a262727b0b663e047571',
        mndContractAddress: '0x658bE7d73EBd0Ba7DCe26c112d9871B7Bed890EC',
        liquidityManagerContractAddress: '0x7ecC3d8519f068D730EEDeCe899C4CdEC7A4E6A1',
        safeAddress: '0xAEEa4E234096b1AcC16c898B6E057Fb0e33F9cC2',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-02-05T17:00:00.000Z'),
        epochDurationInSeconds: 3600,
        mndCliffEpochs: 120,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [baseSepolia],
        ND_LICENSE_CAP: 1575_188843457943924200n,
    },
};

const domain = window.location.hostname;

const domainMainnet = 'app.ratio1.ai';
const domainDevnet = 'devnet-app.ratio1.ai';
const domainTestnet = 'testnet-app.ratio1.ai';

export const environment =
    domain === domainMainnet
        ? ('mainnet' as const)
        : domain === domainDevnet
          ? ('devnet' as const)
          : domain === domainTestnet
            ? ('testnet' as const)
            : ('testnet' as const);

export const config = configs[environment];

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const getCurrentEpoch = () =>
    Math.floor((Date.now() / 1000 - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const getNextEpochTimestamp = (): Date =>
    addSeconds(config.genesisDate, (getCurrentEpoch() + 1) * config.epochDurationInSeconds);

export const wagmiAdapter = new WagmiAdapter({
    networks: config.networks,
    projectId,
    ssr: false,
});
