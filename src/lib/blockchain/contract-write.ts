import {
    BaseError,
    ContractFunctionRevertedError,
    type Account,
    type Abi,
    type Address,
    type Chain,
    type ContractFunctionArgs,
    type ContractFunctionName,
    type PublicClient,
    type SimulateContractParameters,
    type WalletClient,
    type WriteContractReturnType,
} from 'viem';

export type ContractErrorMessage = {
    pattern: RegExp;
    message: string;
};

export class FriendlyContractError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FriendlyContractError';
    }
}

const commonContractErrorMessages: ContractErrorMessage[] = [
    {
        pattern: /User rejected|User denied|rejected the request|denied transaction signature/i,
        message: 'Transaction cancelled. No changes were made.',
    },
    {
        pattern: /AllLicensesSold|PriceTierOversold/i,
        message: 'This license tier is sold out. Please refresh and choose another tier.',
    },
    {
        pattern: /ExceedsMintLimit|InvalidLicenseCount/i,
        message: 'That license quantity is not available. Please lower the quantity and try again.',
    },
    {
        pattern: /WrongPriceTier/i,
        message: 'The active price tier changed. Please refresh the price and try again.',
    },
    {
        pattern: /PriceExceedsMaxAccepted|PriceExceedsAllowedDifference/i,
        message: 'The price moved beyond your accepted slippage. Review the amount and try again.',
    },
    {
        pattern: /InvoiceUuidUsed/i,
        message: 'This purchase request was already used. Please try again to create a fresh transaction.',
    },
    {
        pattern: /R1TransferFailed|ERC20InsufficientAllowance|allowance|TRANSFER_FROM_FAILED/i,
        message: 'The token transfer failed. Check your allowance and balance, then try again.',
    },
    {
        pattern: /ERC20InsufficientBalance|insufficient funds|transfer amount exceeds balance|Insufficient balance/i,
        message: 'Your wallet does not have enough funds for this transaction.',
    },
    {
        pattern: /SwapFailed|INSUFFICIENT_OUTPUT_AMOUNT|EXCESSIVE_INPUT_AMOUNT/i,
        message: 'The swap can no longer be completed at this price. Adjust slippage or try again.',
    },
    {
        pattern: /EXPIRED/i,
        message: 'The swap quote expired. Please try again.',
    },
    {
        pattern: /InvalidNodeAddress|InvalidNodeAddressForRewards/i,
        message: 'This node address is not valid for this action.',
    },
    {
        pattern: /NodeAddressAlreadyRegistered/i,
        message: 'This node address is already linked to another license.',
    },
    {
        pattern: /CannotReassignWithin24Hours/i,
        message: 'This license was linked or unlinked recently. Please wait 24 hours before changing it again.',
    },
    {
        pattern: /CannotUnlinkBeforeClaimingRewards/i,
        message: 'Claim the pending rewards for this license before unlinking it.',
    },
    {
        pattern: /NotLicenseOwner|ERC721IncorrectOwner|ERC721InsufficientApproval/i,
        message: 'Your wallet is not allowed to manage this license.',
    },
    {
        pattern: /ERC721NonexistentToken|NonexistentTokenURI/i,
        message: 'This license no longer exists on-chain. Please refresh and try again.',
    },
    {
        pattern: /LicenseBanned|LicenseAlreadyBanned/i,
        message: 'This license is banned and cannot be used for this action.',
    },
    {
        pattern: /AssignedAmountExceedsLimit|MaxTotalAssignedTokensReached/i,
        message: 'The assigned MND amount exceeds the contract limit.',
    },
    {
        pattern: /InvalidEpochs|IncorrectNumberOfParams|MismatchedInputArraysLength|TimestampBeforeStartEpoch/i,
        message: 'The rewards proof is no longer valid. Please refresh your licenses and try again.',
    },
    {
        pattern: /EnforcedPause|ExpectedPause/i,
        message: 'This contract action is currently paused.',
    },
    {
        pattern: /OwnableUnauthorizedAccount/i,
        message: 'Your wallet is not authorized to perform this admin action.',
    },
    {
        pattern: /Cooldown|cooldown|next claim|24 hours/i,
        message: 'This action is still on cooldown. Please wait and try again later.',
    },
    {
        pattern: /chain|network|fetch|timeout|Failed to fetch/i,
        message: 'Unable to check this transaction on-chain. Check your connection and try again.',
    },
    {
        pattern: /nonce/i,
        message: 'Your wallet has a pending or stale transaction nonce. Check your wallet and try again.',
    },
];

export const getContractErrorDetails = (error: unknown): string => {
    const parts: string[] = [];

    if (error instanceof FriendlyContractError) {
        parts.push(error.message);
    } else if (error instanceof BaseError) {
        const revertedError = error.walk((cause) => cause instanceof ContractFunctionRevertedError);

        if (revertedError instanceof ContractFunctionRevertedError) {
            if (revertedError.data?.errorName) {
                parts.push(revertedError.data.errorName);
            }

            if (revertedError.reason) {
                parts.push(revertedError.reason);
            }
        }

        parts.push(error.shortMessage, error.details, error.message);
    } else if (error instanceof Error) {
        parts.push(error.message);
    }

    return parts.filter(Boolean).join('\n');
};

export const getContractErrorMessage = (
    error: unknown,
    fallbackMessage: string,
    messages: ContractErrorMessage[] = [],
): string => {
    if (error instanceof FriendlyContractError) {
        return error.message;
    }

    const details = getContractErrorDetails(error);
    const match = [...commonContractErrorMessages.slice(0, 1), ...messages, ...commonContractErrorMessages.slice(1)].find(
        ({ pattern }) => pattern.test(details),
    );

    return match?.message ?? fallbackMessage;
};

export const simulateAndWriteContract = async <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
    accountOverride extends Account | Address | null | undefined = Account | Address | null | undefined,
>({
    publicClient,
    walletClient,
    parameters,
}: {
    publicClient: PublicClient;
    walletClient: WalletClient;
    parameters: SimulateContractParameters<abi, functionName, args, Chain | undefined, Chain | undefined, accountOverride>;
}): Promise<WriteContractReturnType> => {
    const account = parameters.account ?? walletClient.account ?? (await walletClient.getAddresses())[0];
    const simulationParameters = { ...parameters, account } as typeof parameters;
    const { request } = await publicClient.simulateContract(simulationParameters);

    return walletClient.writeContract(request as Parameters<WalletClient['writeContract']>[0]);
};
