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
    controllerContractAddress: EthAddress;
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
        controllerContractAddress: '0x90dA5FdaA92edDC80FB73114fb7FE7D97f2be017',
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
            ETH: {
                name: 'Ethereum',
                decimals: 18,
                displayDecimals: 4,
                fromAmount: '0.2',
                logo: EthLogo,
                swapPath: [
                    '0x4200000000000000000000000000000000000006',
                    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                    '0x6444C6c2D527D85EA97032da9A7504d6d1448ecF',
                ],
            },
            USDC: {
                name: 'USDC',
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', '0x6444C6c2D527D85EA97032da9A7504d6d1448ecF'],
            },
        },
    },
    testnet: {
        backendUrl: 'https://testnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://testnet-oracle.ratio1.ai',
        r1ContractAddress: '0xCC96f389F45Fc08b4fa8e2bC4C7DA9920292ec64',
        ndContractAddress: '0x18E86a5829CA1F02226FA123f30d90dCd7cFd0ED',
        mndContractAddress: '0xa8d7FFCE91a888872A9f5431B4Dd6c0c135055c1',
        controllerContractAddress: '0x63BEC1B3004154698830C7736107E7d3cfcbde79',
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
            ETH: {
                name: 'Ethereum',
                decimals: 18,
                displayDecimals: 4,
                fromAmount: '0.2',
                logo: EthLogo,
                swapPath: [
                    '0x24fe7807089e321395172633aA9c4bBa4Ac4a357',
                    '0x2d6a9cda5179399Ee6c44d78550696e68400F677',
                    '0xCC96f389F45Fc08b4fa8e2bC4C7DA9920292ec64',
                ],
            },
            USDC: {
                name: 'USDC',
                address: '0x2d6a9cda5179399Ee6c44d78550696e68400F677',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0x2d6a9cda5179399Ee6c44d78550696e68400F677', '0xCC96f389F45Fc08b4fa8e2bC4C7DA9920292ec64'],
            },
        },
    },
    devnet: {
        backendUrl: 'https://devnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://devnet-oracle.ratio1.ai',
        r1ContractAddress: '0x07C5678F0f4aC347496eAA8D6031b37FF3402CE5',
        ndContractAddress: '0x8D0CE4933728FF7C04388f0bEcC9a45676E232F7',
        mndContractAddress: '0x7A14Be75135a7ebdef99339CCc700C25Cda60c6E',
        controllerContractAddress: '0xdd56E920810e2FD9a07C1718643E179839867253',
        faucetContractAddress: '0x4a1bC775410067Ad5468945EF7ca5b0C510CDD99',
        uniswapV2RouterAddress: '0x6682375ebC1dF04676c0c5050934272368e6e883',
        safeAddress: '0x20b1ebc9c13A6F4f3dfBdF9bc9299ec40Ac988e3',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-05-23T16:00:00.000Z'),
        epochDurationInSeconds: 3600, // 1 hour
        mndCliffEpochs: 223,
        gndVestingEpochs: 365,
        mndVestingEpochs: 900,
        ndVestingEpochs: 1080,
        networks: [baseSepolia],
        ND_LICENSE_CAP: 1575_188843457943924200n,
        swapTokensDetails: {
            ETH: {
                name: 'Ethereum',
                decimals: 18,
                displayDecimals: 4,
                fromAmount: '0.2',
                logo: EthLogo,
                swapPath: [
                    '0x24fe7807089e321395172633aA9c4bBa4Ac4a357',
                    '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                    '0x07C5678F0f4aC347496eAA8D6031b37FF3402CE5',
                ],
            },
            USDC: {
                name: 'USDC',
                address: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF', '0x07C5678F0f4aC347496eAA8D6031b37FF3402CE5'],
            },
        },
    },
};

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

export const environment: 'mainnet' | 'testnet' | 'devnet' =
    domain === domainMainnet
        ? ('mainnet' as const)
        : domain === domainDevnet
          ? ('devnet' as const)
          : domain === domainTestnet
            ? ('testnet' as const)
            : ('mainnet' as const);

export const getR1ExplorerUrl = () => `https://${environment === 'mainnet' ? '' : `${environment}-`}${explorerBaseDomain}`;

export const config = configs[environment];

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const getCurrentEpoch = () =>
    Math.floor((Date.now() / 1000 - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const getNextEpochTimestamp = (): Date =>
    addSeconds(config.genesisDate, (getCurrentEpoch() + 1) * config.epochDurationInSeconds);

export const getLicenseAssignEpoch = (assignTimestamp: bigint) =>
    Math.floor((Number(assignTimestamp) - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);
