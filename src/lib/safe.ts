import { config } from './config';
import { type Hash, type PublicClient, type TransactionReceipt } from 'viem';

const SAFE_TX_SERVICE_BY_CHAIN_ID: Record<number, string> = {
    8453: 'https://safe-transaction-base.safe.global',
    84532: 'https://safe-transaction-base-sepolia.safe.global',
};
const SAFE_TX_POLL_INTERVAL_MS = 2_000;
const SAFE_TX_LOOKUP_TIMEOUT_MS = 10_000;
const SAFE_TX_WAIT_TIMEOUT_MS = 20 * 60 * 1_000;

type SafeTxDetailsResponse = {
    transactionHash?: string | null;
};

type WaitForSafeOrChainTransactionReceiptParams = {
    txHash: string;
    publicClient: PublicClient;
    confirmations?: number;
};

const delay = (durationMs: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, durationMs));

const isHash = (value: string): value is Hash => value.startsWith('0x');

const getTransactionReceiptIfAvailable = async (
    publicClient: PublicClient,
    txHash: Hash,
): Promise<TransactionReceipt | null> => {
    try {
        return (await publicClient.getTransactionReceipt({ hash: txHash })) as TransactionReceipt;
    } catch {
        return null;
    }
};

const waitForConfirmedReceipt = async (
    publicClient: PublicClient,
    txHash: Hash,
    confirmations: number,
    timeoutAt: number,
): Promise<TransactionReceipt> => {
    return publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations,
        timeout: Math.max(timeoutAt - Date.now(), SAFE_TX_POLL_INTERVAL_MS),
    }) as Promise<TransactionReceipt>;
};

const resolveSafeTxHashToChainTxHash = async (safeTxUrl: string): Promise<Hash | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SAFE_TX_LOOKUP_TIMEOUT_MS);

    try {
        const response = await fetch(safeTxUrl, { signal: controller.signal });

        if (response.ok) {
            const details = (await response.json()) as SafeTxDetailsResponse;
            console.log('Safe transaction details', details);
            const chainTxHash = details.transactionHash;

            if (typeof chainTxHash === 'string' && isHash(chainTxHash)) {
                return chainTxHash;
            }
        } else if (response.status !== 404) {
            console.error('Safe transaction lookup failed', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Safe transaction lookup error', error);
    } finally {
        clearTimeout(timeoutId);
    }

    return null;
};

export const waitForSafeOrChainTransactionReceipt = async ({
    txHash,
    publicClient,
    confirmations = 1,
}: WaitForSafeOrChainTransactionReceiptParams): Promise<TransactionReceipt> => {
    if (!isHash(txHash)) {
        throw new Error('Invalid transaction hash.');
    }

    const safeTxServiceUrl = SAFE_TX_SERVICE_BY_CHAIN_ID[config.networks[0].id];
    const safeTxUrl = safeTxServiceUrl ? `${safeTxServiceUrl}/api/v1/multisig-transactions/${txHash}/` : null;
    const timeoutAt = Date.now() + SAFE_TX_WAIT_TIMEOUT_MS;
    let resolvedChainTxHash: Hash | null = null;

    while (Date.now() < timeoutAt) {
        const directReceipt = await getTransactionReceiptIfAvailable(publicClient, txHash);
        if (directReceipt) {
            return waitForConfirmedReceipt(publicClient, directReceipt.transactionHash, confirmations, timeoutAt);
        }

        if (!resolvedChainTxHash && safeTxUrl) {
            resolvedChainTxHash = await resolveSafeTxHashToChainTxHash(safeTxUrl);
        }

        if (resolvedChainTxHash) {
            const safeReceipt = await getTransactionReceiptIfAvailable(publicClient, resolvedChainTxHash);
            if (safeReceipt) {
                return waitForConfirmedReceipt(publicClient, safeReceipt.transactionHash, confirmations, timeoutAt);
            }
        }

        await delay(SAFE_TX_POLL_INTERVAL_MS);
    }

    if (!safeTxServiceUrl) {
        throw new Error(
            'Transaction tracking timeout. Safe transaction service is not configured for this chain, and the transaction was not found on-chain.',
        );
    }

    throw new Error('Safe transaction execution timeout. Please check the Safe queue and try again.');
};
