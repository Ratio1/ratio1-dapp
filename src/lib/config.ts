import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { AppKitNetwork, base, baseSepolia } from '@reown/appkit/networks';
import { EthAddress, SwapTokenDetails } from '@typedefs/blockchain';
import { addSeconds } from 'date-fns';
import R1Logo from '@assets/token.svg';
import UsdcLogo from '@assets/usdc.svg';
import EthLogo from '@assets/eth.svg';

type Config = {
    backendUrl: string;
    oraclesUrl: string;
    r1ContractAddress: EthAddress;
    ndContractAddress: EthAddress;
    mndContractAddress: EthAddress;
    liquidityManagerContractAddress: EthAddress;
    uniswapV2RouterAddress: EthAddress;
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
    swapTokensDetails: Record<string, SwapTokenDetails>;
};

const configs: {
    [key in 'mainnet' | 'testnet' | 'devnet']: Config;
} = {
    mainnet: {
        backendUrl: 'https://dapp-api.ratio1.ai',
        oraclesUrl: 'https://oracle.ratio1.ai',
        r1ContractAddress: '0xc992DcaB6D3F8783fBf0c935E7bCeB20aa50A6f1',
        ndContractAddress: '0xE20198EE2B76eED916A568a47cdea9681f7c79BF',
        mndContractAddress: '0xfD52a7958088dF734D523d618e583e4d53cD7420',
        liquidityManagerContractAddress: '0xTODO',
        uniswapV2RouterAddress: '0xTODO',
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
        swapTokensDetails: {},
    },
    testnet: {
        backendUrl: 'https://testnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://testnet-oracle.ratio1.ai',
        r1ContractAddress: '0xc992dcab6d3f8783fbf0c935e7bceb20aa50a6f1',
        ndContractAddress: '0xE20198EE2B76eED916A568a47cdea9681f7c79BF',
        mndContractAddress: '0xfD52a7958088dF734D523d618e583e4d53cD7420',
        faucetContractAddress: '0x22bC5B72Fc156FC89322c2519A03Bd47075e1e99',
        liquidityManagerContractAddress: '0x5F4553e231649adD7dfF5e3063357Fd73927e465',
        uniswapV2RouterAddress: '0x6682375ebC1dF04676c0c5050934272368e6e883',
        safeAddress: '0x591E079f22477906457a4bC246e9Ef4353DB428A',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-02-05T16:00:00.000Z'),
        epochDurationInSeconds: 86400, // 24 hours
        mndCliffEpochs: 120,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [baseSepolia],
        ND_LICENSE_CAP: 1575_188843457943924200n,
        swapTokensDetails: {
            USDC: {
                address: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                decimals: 6,
                displayDecimals: 2,
                symbol: '500',
                logo: UsdcLogo,
                swapPath: ['0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF', '0xc992dcab6d3f8783fbf0c935e7bceb20aa50a6f1'],
            },
            ETH: {
                decimals: 18,
                displayDecimals: 4,
                symbol: '0.2',
                logo: EthLogo,
                swapPath: [
                    '0x24fe7807089e321395172633aA9c4bBa4Ac4a357',
                    '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                    '0xc992dcab6d3f8783fbf0c935e7bceb20aa50a6f1',
                ],
            },
        },
    },
    devnet: {
        backendUrl: 'https://devnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://devnet-oracle.ratio1.ai',
        r1ContractAddress: '0xEF38a3d84D3E3111fb7b794Ba3240187b8B32825',
        ndContractAddress: '0x9f49fc29366F1C8285d42e7E82cA0bb668B32CeA',
        mndContractAddress: '0x909d33Ab74d5A85F1fc963ae63af7B97eAe76f40',
        faucetContractAddress: '0xd4c6B97E9a7f31eDF57285DcE4Fc59a2746013e2',
        liquidityManagerContractAddress: '0xE5C61ADEeE7850a8656A10f3963036e5c045B508',
        uniswapV2RouterAddress: '0x6682375ebC1dF04676c0c5050934272368e6e883',
        safeAddress: '0x206F930e0b10a69A0ECe8110319af96a7E786Ec0',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-02-12T16:00:00.000Z'),
        epochDurationInSeconds: 3600, // 1 hour
        mndCliffEpochs: 120,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [baseSepolia],
        ND_LICENSE_CAP: 1575_188843457943924200n,
        swapTokensDetails: {
            USDC: {
                address: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                decimals: 6,
                displayDecimals: 2,
                symbol: '500',
                logo: UsdcLogo,
                swapPath: ['0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF', '0xEF38a3d84D3E3111fb7b794Ba3240187b8B32825'],
            },
            ETH: {
                decimals: 18,
                displayDecimals: 4,
                symbol: '0.2',
                logo: EthLogo,
                swapPath: [
                    '0x24fe7807089e321395172633aA9c4bBa4Ac4a357',
                    '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                    '0xEF38a3d84D3E3111fb7b794Ba3240187b8B32825',
                ],
            },
        },
    },
};

const domain = window.location.hostname;

const domainMainnet = 'app.ratio1.ai';
const domainDevnet = 'devnet-app.ratio1.ai';
const domainTestnet = 'testnet-app.ratio1.ai';

export const domains = {
    mainnet: domainMainnet,
    devnet: domainDevnet,
    testnet: domainTestnet,
};

export const environment: 'mainnet' | 'testnet' | 'devnet' =
    domain === domainMainnet
        ? ('mainnet' as const)
        : domain === domainDevnet
          ? ('devnet' as const)
          : domain === domainTestnet
            ? ('testnet' as const)
            : ('devnet' as const);

export const config = configs[environment];

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const getCurrentEpoch = () =>
    Math.floor((Date.now() / 1000 - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const getNextEpochTimestamp = (): Date =>
    addSeconds(config.genesisDate, (getCurrentEpoch() + 1) * config.epochDurationInSeconds);

export const getLicenseAssignEpoch = (assignTimestamp: bigint) =>
    Math.floor((Number(assignTimestamp) - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const wagmiAdapter = new WagmiAdapter({
    networks: config.networks,
    projectId,
    ssr: false,
});
