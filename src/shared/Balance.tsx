import { getShortAddress } from '@lib/utils';
import { useEffect } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useBalance, useChainId, useEnsAvatar, useEnsName } from 'wagmi';

const Balance = () => {
    const chainId = useChainId();
    const { address } = useAccount(); // Get connected wallet address

    const { data: balance, isLoading: balanceLoading } = useBalance({
        address,
        chainId,
    });

    // Get ENS name
    const { data: ensName } = useEnsName({
        address,
        chainId: 1,
    });

    const ensNameNormalized = ensName || undefined; // Convert null to undefined

    // Get ENS Avatar (Profile Picture)
    const { data: ensAvatar } = useEnsAvatar({
        name: ensNameNormalized,
        chainId: 1,
    });

    useEffect(() => {
        console.log({ ensAvatar, ensName });
    }, [ensAvatar, ensName]);

    if (!address) {
        return null;
    }

    return (
        <div className="rounded border p-4">
            {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" className="mb-2 h-16 w-16 rounded-full" />}
            <p>
                <strong>Address:</strong> {getShortAddress(address)}
            </p>
            <p>
                <strong>ENS Name:</strong> {ensName || 'No ENS Name'}
            </p>
            <p>
                <strong>Balance:</strong>{' '}
                {balanceLoading || !balance
                    ? 'Loading...'
                    : `${parseFloat(Number(formatUnits(balance.value, balance.decimals)).toFixed(3))} ETH`}
            </p>
        </div>
    );
};

export default Balance;
