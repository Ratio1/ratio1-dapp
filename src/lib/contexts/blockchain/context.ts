import { EthAddress, License, PriceTier } from '@typedefs/blockchain';
import { createContext } from 'react';
import { TransactionReceipt } from 'viem';

export interface BlockchainContextType {
    watchTx: (txHash: string, publicClient: any) => Promise<TransactionReceipt>;

    // Licenses
    licenses: License[];
    isLoadingLicenses: boolean;
    fetchLicensesWithRewards: () => Promise<any[]>;
    fetchLicenses: () => Promise<License[]>;
    setLicenses: React.Dispatch<React.SetStateAction<License[]>>;

    // R1 Balance
    r1Balance: bigint;
    setR1Balance: React.Dispatch<React.SetStateAction<bigint>>;
    fetchR1Balance: () => void;

    // R1 Price
    r1Price: bigint;
    fetchR1Price: () => void;

    // Price tiers
    currentPriceTier: number;
    priceTiers: PriceTier[];
    isLoadingPriceTiers: boolean;
    fetchPriceTiers: () => Promise<void>;

    // License buying
    isBuyDrawerOpen: boolean;
    onBuyDrawerOpen: () => void;
    onBuyDrawerClose: () => void;

    // Generic blockchain functions
    fetchErc20Balance: (tokenAddress: EthAddress) => Promise<bigint>;
}

export const BlockchainContext = createContext<BlockchainContextType | null>(null);
