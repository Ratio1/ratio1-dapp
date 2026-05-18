import EthLogo from '@assets/tokens/ethereum.png';
import UsdcLogo from '@assets/tokens/usdc.svg';
import { EthAddress, SwapTokenDetails } from '@typedefs/blockchain';
import { addSeconds } from 'date-fns';
import { Chain } from 'viem';
import { base, baseSepolia } from 'wagmi/chains';

type Config = {
    backendUrl: string;
    oraclesUrl: string;
    r1ContractAddress: EthAddress;
    ndContractAddress: EthAddress;
    mndContractAddress: EthAddress;
    poaiManagerContractAddress: EthAddress;
    controllerContractAddress: EthAddress;
    readerContractAddress: EthAddress;
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
    networks: [Chain, ...Chain[]];
    ND_LICENSE_CAP: bigint;
    swapTokensDetails: Record<string, SwapTokenDetails>;
};

const configs: {
    [key in 'mainnet' | 'testnet' | 'devnet']: Config;
} = {
    mainnet: {
        backendUrl: 'https://dapp-api.ratio1.ai',
        oraclesUrl: 'https://oracle.ratio1.ai',
        r1ContractAddress: '0x6444C6c2D527D85EA97032da9A7504d6d1448ecF',
        ndContractAddress: '0xE658DF6dA3FB5d4FBa562F1D5934bd0F9c6bd423',
        mndContractAddress: '0x0C431e546371C87354714Fcc1a13365391A549E2',
        poaiManagerContractAddress: '0xa8d7FFCE91a888872A9f5431B4Dd6c0c135055c1',
        controllerContractAddress: '0x90dA5FdaA92edDC80FB73114fb7FE7D97f2be017',
        readerContractAddress: '0xa2fDD4c7E93790Ff68a01f01AA789D619F12c6AC',
        uniswapV2RouterAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
        safeAddress: '0x2265539ae09c7A605A707E11a6ED4aF1d018750e',
        explorerUrl: 'https://basescan.org',
        genesisDate: new Date('2025-05-23T16:00:00.000Z'),
        epochDurationInSeconds: 86400, // 24 hours
        mndCliffEpochs: 223,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [base],
        ND_LICENSE_CAP: 1575_188843457943924200n,
        swapTokensDetails: {
            USDC: {
                name: 'USDC',
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '250',
                logo: UsdcLogo,
                swapPath: ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', '0x6444C6c2D527D85EA97032da9A7504d6d1448ecF'],
            },
            ETH: {
                name: 'Ethereum',
                decimals: 18,
                displayDecimals: 4,
                fromAmount: '0.1',
                logo: EthLogo,
                swapPath: [
                    '0x4200000000000000000000000000000000000006',
                    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                    '0x6444C6c2D527D85EA97032da9A7504d6d1448ecF',
                ],
            },
        },
    },
    testnet: {
        backendUrl: 'https://testnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://testnet-oracle.ratio1.ai',
        r1ContractAddress: '0xCC96f389F45Fc08b4fa8e2bC4C7DA9920292ec64',
        ndContractAddress: '0x18E86a5829CA1F02226FA123f30d90dCd7cFd0ED',
        mndContractAddress: '0xa8d7FFCE91a888872A9f5431B4Dd6c0c135055c1',
        poaiManagerContractAddress: '0x68f825aA8fD4Af498c2998F4b165F103080574d4',
        controllerContractAddress: '0x63BEC1B3004154698830C7736107E7d3cfcbde79',
        readerContractAddress: '0xd1c7Dca934B37FAA402EB2EC64F6644d6957bE3b',
        faucetContractAddress: '0x4a1bC775410067Ad5468945EF7ca5b0C510CDD99',
        uniswapV2RouterAddress: '0x6682375ebC1dF04676c0c5050934272368e6e883',
        safeAddress: '0x5afF90797f717Fe8432A1809b6b53A18863061D6',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-05-23T16:00:00.000Z'),
        epochDurationInSeconds: 86400, // 24 hours
        mndCliffEpochs: 223,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [baseSepolia],
        ND_LICENSE_CAP: 1575_188843457943924200n,
        swapTokensDetails: {
            USDC: {
                name: 'USDC',
                address: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF', '0xCC96f389F45Fc08b4fa8e2bC4C7DA9920292ec64'],
            },
            ETH: {
                name: 'Ethereum',
                decimals: 18,
                displayDecimals: 4,
                fromAmount: '0.2',
                logo: EthLogo,
                swapPath: [
                    '0x24fe7807089e321395172633aA9c4bBa4Ac4a357',
                    '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                    '0xCC96f389F45Fc08b4fa8e2bC4C7DA9920292ec64',
                ],
            },
        },
    },
    devnet: {
        backendUrl: 'https://devnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://devnet-oracle.ratio1.ai',
        r1ContractAddress: '0x36DA1A175830776c596Ae0426a6598DD7f9E5815',
        ndContractAddress: '0xB6b6539e702074902EB796a84443395A686F82d6',
        mndContractAddress: '0xC53D1163c54139520991F757eaFa605E5fa00786',
        poaiManagerContractAddress: '0x7e3fda628DfF6C84e7E7cC8cC6F4C032b9fBef88',
        controllerContractAddress: '0x9100E251109A9a7086A5499B10A4800583e69792',
        readerContractAddress: '0x85D8B51f266b95aA6B5B3bB3909D6d5da9A54908',
        faucetContractAddress: '0x4a1bC775410067Ad5468945EF7ca5b0C510CDD99',
        uniswapV2RouterAddress: '0x6682375ebC1dF04676c0c5050934272368e6e883',
        safeAddress: '0x20b1ebc9c13A6F4f3dfBdF9bc9299ec40Ac988e3',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2026-05-01T16:00:00.000Z'),
        epochDurationInSeconds: 14_400, // 4 hours
        mndCliffEpochs: 223,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [baseSepolia],
        ND_LICENSE_CAP: 1575_188843457943924200n,
        swapTokensDetails: {
            USDC: {
                name: 'USDC',
                address: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF', '0x36DA1A175830776c596Ae0426a6598DD7f9E5815'],
            },
            ETH: {
                name: 'Ethereum',
                decimals: 18,
                displayDecimals: 4,
                fromAmount: '0.2',
                logo: EthLogo,
                swapPath: [
                    '0x24fe7807089e321395172633aA9c4bBa4Ac4a357',
                    '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                    '0x36DA1A175830776c596Ae0426a6598DD7f9E5815',
                ],
            },
        },
    },
};

export const adminAddresses = [
    '0x95E9EeEf459a9cDA096af7C6033D4d9582B9513c',
    '0xDA05C48CDbA9A67A422cFA40b4C0F6b7FFB0E4a5',
    '0xE75981c3fb2734F263cEa7F81fF2Dd6586c1BF9A',
    '0xA59eF3f6B10723577e7F8966dC88670233B8a0d5',
    '0x464579c1Dc584361e63548d2024c2db4463EdE48',
];

const domain = window.location.hostname;

const domainMainnet = 'app.ratio1.ai';
const domainDevnet = 'devnet-app.ratio1.ai';
const domainTestnet = 'testnet-app.ratio1.ai';

const explorerBaseDomain = 'explorer.ratio1.ai';

export const domains = {
    mainnet: domainMainnet,
    devnet: domainDevnet,
    testnet: domainTestnet,
};

// Default to devnet for local development if not specified
const envFromBuild = import.meta.env.VITE_ENVIRONMENT as 'mainnet' | 'testnet' | 'devnet' | undefined;
export const environment: 'mainnet' | 'testnet' | 'devnet' = envFromBuild || 'devnet';

export const getR1ExplorerUrl = () => `https://${environment === 'mainnet' ? '' : `${environment}-`}${explorerBaseDomain}`;

export const config = configs[environment];

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const getCurrentEpoch = () =>
    Math.floor((Date.now() / 1000 - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const getNextEpochTimestamp = (): Date =>
    addSeconds(config.genesisDate, (getCurrentEpoch() + 1) * config.epochDurationInSeconds);

export const getLicenseAssignEpoch = (assignTimestamp: bigint) =>
    Math.floor((Number(assignTimestamp) - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const getDevAddress = (): {
    address: EthAddress;
} => ({
    address: (import.meta.env.VITE_DEV_ADDRESS as EthAddress) || '0x0000000000000000000000000000000000000000',
});

export const isUsingDevAddress = process.env.NODE_ENV === 'development' && false;
