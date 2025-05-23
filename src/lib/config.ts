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
        r1ContractAddress: '0xc992DcaB6D3F8783fBf0c935E7bCeB20aa50A6f1',
        ndContractAddress: '0xE20198EE2B76eED916A568a47cdea9681f7c79BF',
        mndContractAddress: '0xfD52a7958088dF734D523d618e583e4d53cD7420',
        controllerContractAddress: '0xTODO',
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
        r1ContractAddress: '0x8cEa8b574FbF20B9D2548f357B9Bf6DeA5A2204A',
        ndContractAddress: '0xE658DF6dA3FB5d4FBa562F1D5934bd0F9c6bd423',
        mndContractAddress: '0xAb2F1F31489BAa339d58470737dD6E5d55484261',
        controllerContractAddress: '0x9964A5dfc860626c3b30FB764162773cD1D4Ad95',
        faucetContractAddress: '0xec92d8B5DB97D6C38460CDa00a3D56ad74F11783',
        uniswapV2RouterAddress: '0x6682375ebC1dF04676c0c5050934272368e6e883',
        safeAddress: '0xA8dBa4C9E71Da20D5D23a43A17C98aed3E9885Eb',
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
                    '0x8cEa8b574FbF20B9D2548f357B9Bf6DeA5A2204A',
                ],
            },
            USDC: {
                name: 'USDC',
                address: '0x2d6a9cda5179399Ee6c44d78550696e68400F677',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0x2d6a9cda5179399Ee6c44d78550696e68400F677', '0x8cEa8b574FbF20B9D2548f357B9Bf6DeA5A2204A'],
            },
        },
    },
    devnet: {
        backendUrl: 'https://devnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://devnet-oracle.ratio1.ai',
        r1ContractAddress: '0xe5c5db390743D96e0eb08BC5AdC4E27DB0624c0C',
        ndContractAddress: '0x3814A2110f2269d773a90F5F24fdfE4cb89823ea',
        mndContractAddress: '0x114f9995cc09cfc708533591cc93f2900Bb4997E',
        controllerContractAddress: '0xa2fDD4c7E93790Ff68a01f01AA789D619F12c6AC',
        faucetContractAddress: '0xec92d8B5DB97D6C38460CDa00a3D56ad74F11783',
        uniswapV2RouterAddress: '0x6682375ebC1dF04676c0c5050934272368e6e883',
        safeAddress: '0xAC9c75b5e15041EeE1f042C7b1067eE80dd5FD45',
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
                    '0xe5c5db390743D96e0eb08BC5AdC4E27DB0624c0C',
                ],
            },
            USDC: {
                name: 'USDC',
                address: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
                decimals: 6,
                displayDecimals: 2,
                fromAmount: '500',
                logo: UsdcLogo,
                swapPath: ['0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF', '0xe5c5db390743D96e0eb08BC5AdC4E27DB0624c0C'],
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
