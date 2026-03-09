import { config } from './config';

const SAFE_TX_SERVICE_BY_CHAIN_ID: Record<number, string> = {
    8453: 'https://safe-transaction-base.safe.global',
    84532: 'https://safe-transaction-base-sepolia.safe.global',
};
const SAFE_TX_POLL_INTERVAL_MS = 2_000;
const SAFE_TX_WAIT_TIMEOUT_MS = 20 * 60 * 1_000;

type SafeTxDetailsResponse = {
    transactionHash?: string | null;
};

export const resolveSafeTxHashToChainTxHash = async (safeTxHash: string): Promise<string> => {
    const safeTxServiceUrl = SAFE_TX_SERVICE_BY_CHAIN_ID[config.networks[0].id];
    if (!safeTxServiceUrl) {
        throw new Error('Safe transaction service not configured for this chain.');
    }

    const safeTxUrl = `${safeTxServiceUrl}/api/v1/multisig-transactions/${safeTxHash}/`;
    const timeoutAt = Date.now() + SAFE_TX_WAIT_TIMEOUT_MS;

    while (Date.now() < timeoutAt) {
        try {
            const response = await fetch(safeTxUrl);

            if (response.ok) {
                const details = (await response.json()) as SafeTxDetailsResponse;
                console.log('Safe transaction details', details);
                const chainTxHash = details.transactionHash;

                if (typeof chainTxHash === 'string' && chainTxHash.startsWith('0x')) {
                    return chainTxHash;
                }
            } else if (response.status !== 404) {
                console.error('Safe transaction lookup failed', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Safe transaction lookup error', error);
        }

        await new Promise((resolve) => setTimeout(resolve, SAFE_TX_POLL_INTERVAL_MS));
    }

    throw new Error('Safe transaction execution timeout. Please check the Safe queue and try again.');
};
