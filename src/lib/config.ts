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
        r1ContractAddress: '0xc992DcaB6D3F8783fBf0c935E7bCeB20aa50A6f1',
        ndContractAddress: '0xE20198EE2B76eED916A568a47cdea9681f7c79BF',
        mndContractAddress: '0xfD52a7958088dF734D523d618e583e4d53cD7420',
        controllerContractAddress: '0xTODO',
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
        r1ContractAddress: '0x8520497BcB63e48008673bA4D2D38d075AC1d127',
        ndContractAddress: '0x3026e13534f0E9A49520445761F42577989F3D31',
        mndContractAddress: '0x911A520bB6a5F332377D6f24448d8B761Bc1d990',
        controllerContractAddress: '0x0B06f129BE9E7e867a6095da84A9Bb7745238373',
        faucetContractAddress: '0xec92d8B5DB97D6C38460CDa00a3D56ad74F11783',
        liquidityManagerContractAddress: '0xTODO',
        uniswapV2RouterAddress: '0x6682375ebC1dF04676c0c5050934272368e6e883',
        safeAddress: '0xfad0050957E9261660FFd24BB49D42D920430FC8',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-05-15T12:00:00.000Z'),
        epochDurationInSeconds: 3600, // 1 hour
        mndCliffEpochs: 120,
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
                    '0x8520497BcB63e48008673bA4D2D38d075AC1d127',
                ],
            },
            USDC: {
                name: 'USDC',
                address: '0x2d6a9cda5179399Ee6c44d78550696e68400F677',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0x2d6a9cda5179399Ee6c44d78550696e68400F677', '0x8520497BcB63e48008673bA4D2D38d075AC1d127'],
            },
        },
    },
    devnet: {
        backendUrl: 'https://devnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://devnet-oracle.ratio1.ai',
        r1ContractAddress: '0xEF38a3d84D3E3111fb7b794Ba3240187b8B32825',
        ndContractAddress: '0x9f49fc29366F1C8285d42e7E82cA0bb668B32CeA',
        mndContractAddress: '0x909d33Ab74d5A85F1fc963ae63af7B97eAe76f40',
        controllerContractAddress: '0xTODO',
        faucetContractAddress: '0x4a1bC775410067Ad5468945EF7ca5b0C510CDD99',
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
            ETH: {
                name: 'Ethereum',
                decimals: 18,
                displayDecimals: 4,
                fromAmount: '0.2',
                logo: EthLogo,
                swapPath: [
                    '0x24fe7807089e321395172633aA9c4bBa4Ac4a357',
                    '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                    '0xEF38a3d84D3E3111fb7b794Ba3240187b8B32825',
                ],
            },
            USDC: {
                name: 'USDC',
                address: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF', '0xEF38a3d84D3E3111fb7b794Ba3240187b8B32825'],
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
            : ('testnet' as const);

export const getR1ExplorerUrl = () => `https://${environment === 'mainnet' ? '' : `${environment}-`}${explorerBaseDomain}`;

export const config = configs[environment];

export const projectId = '6fb791d3d18d57d28ae7677e4cff8c6e';

export const getCurrentEpoch = () =>
    Math.floor((Date.now() / 1000 - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const getNextEpochTimestamp = (): Date =>
    addSeconds(config.genesisDate, (getCurrentEpoch() + 1) * config.epochDurationInSeconds);

export const getLicenseAssignEpoch = (assignTimestamp: bigint) =>
    Math.floor((Number(assignTimestamp) - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);
