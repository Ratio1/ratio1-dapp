import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { linkLicense, multiLinkLicense } from '@lib/api/backend';
import { getContractErrorMessage, simulateAndWriteContract } from '@lib/blockchain/contract-write';
import { config, getCurrentEpoch, getDevAddress, isUsingDevAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import useNodeKeyRotations from '@lib/useNodeKeyRotations';
import { DetailedAlert } from '@shared/DetailedAlert';
import EmptyData from '@shared/EmptyData';
import { ConnectKitButton } from 'connectkit';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCpuLine, RiWalletLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { EthAddress, License } from 'typedefs/blockchain';
import { getAddress, isAddress } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

const itemKey = (license: License) => `${license.type}-${license.licenseId.toString()}`;

// The contract only unlinks a license whose rewards were claimed in the current epoch,
// and job (PoAI) rewards of the old node address cannot be claimed after the relink.
const hasPendingRewards = (license: License) =>
    Number(license.lastClaimEpoch) < getCurrentEpoch() ||
    (license.type === 'ND' && (license.usdcPoaiRewards > 0n || license.r1PoaiRewards > 0n));

function RelinkNodes() {
    const { watchTx, licenses, isLoadingLicenses, fetchLicenses } = useBlockchainContext() as BlockchainContextType;
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const items = useNodeKeyRotations(licenses);
    // Address typed or prefilled for each license; missing means the announced one.
    const [edited, setEdited] = useState<Record<string, string>>({});
    const [isSubmitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (authenticated && !!address && publicClient) {
            fetchLicenses();
        }
    }, [authenticated, address, publicClient]);

    const getValue = (license: License, newNodeAddress: EthAddress) => edited[itemKey(license)] ?? newNodeAddress;

    const getError = (license: License, newNodeAddress: EthAddress): string | undefined => {
        const value = getValue(license, newNodeAddress);
        if (!isAddress(value, { strict: false })) {
            return 'Enter a valid node ETH address';
        }
        if (value.toLowerCase() === license.nodeAddress.toLowerCase()) {
            return 'This is the old, revoked address';
        }
        const sameAddress = items.filter(
            (item) => getValue(item.license, item.newNodeAddress).toLowerCase() === value.toLowerCase(),
        );
        if (sameAddress.length > 1) {
            return 'The same address is entered for another license';
        }
        return undefined;
    };

    const licensesWithPendingRewards = items.filter(({ license }) => hasPendingRewards(license));
    const canRelink =
        items.length > 0 &&
        licensesWithPendingRewards.length === 0 &&
        items.every(({ license, newNodeAddress }) => !getError(license, newNodeAddress));

    const link = async (license: License, nodeAddress: EthAddress) => {
        if (!publicClient || !walletClient) {
            throw new Error('Wallet not ready, please try again.');
        }
        const { signature } = await linkLicense(nodeAddress);
        const txHash = await simulateAndWriteContract({
            publicClient,
            walletClient,
            parameters: {
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'linkNode',
                args: [license.licenseId, nodeAddress, `0x${signature}`],
            },
        });
        await watchTx(txHash, publicClient);
    };

    // ND licenses are relinked in one transaction; MND/GND licenses one by one.
    const onRelink = async () => {
        if (!publicClient || !walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        const assignments = items.map(({ license, newNodeAddress }) => ({
            license,
            nodeAddress: getAddress(getValue(license, newNodeAddress)),
        }));
        const ndAssignments = assignments.filter(({ license }) => license.type === 'ND');

        setSubmitting(true);
        try {
            if (ndAssignments.length > 0) {
                const nodeAddresses = ndAssignments.map(({ nodeAddress }) => nodeAddress);
                const { signature } = await multiLinkLicense(nodeAddresses);
                const txHash = await simulateAndWriteContract({
                    publicClient,
                    walletClient,
                    parameters: {
                        address: config.ndContractAddress,
                        abi: NDContractAbi,
                        functionName: 'linkMultiNode',
                        args: [ndAssignments.map(({ license }) => license.licenseId), nodeAddresses, `0x${signature}`],
                    },
                });
                await watchTx(txHash, publicClient);
            }

            for (const { license, nodeAddress } of assignments.filter(({ license }) => license.type !== 'ND')) {
                await link(license, nodeAddress);
            }
        } catch (error) {
            console.error('[Relink] failed', error);
            toast.error(getContractErrorMessage(error, 'Relinking failed. Please try again.'));
        } finally {
            setSubmitting(false);
            // Using a timeout here to make sure fetchLicenses returns the updated smart contract data
            setTimeout(() => {
                fetchLicenses(true);
            }, 250);
        }
    };

    if (!authenticated) {
        return (
            <div className="col w-full p-6">
                <DetailedAlert
                    icon={<RiWalletLine />}
                    title="Connect Wallet"
                    description={
                        <div>To proceed, please connect & sign in using your wallet so we can identify your licenses.</div>
                    }
                >
                    <ConnectKitButton />
                </DetailedAlert>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="center-all w-full py-14">
                <EmptyData
                    title={isLoadingLicenses ? 'Loading your licenses' : 'Nothing to relink'}
                    description="Licenses whose nodes announced a new key will be displayed here"
                    icon={<RiCpuLine />}
                />
            </div>
        );
    }

    return (
        <div className="col w-full gap-4">
            <Alert color="warning" classNames={{ base: 'items-start' }} title="Check every address on your machine">
                <div className="text-sm">
                    Each node replaced its revoked key and printed its new ETH address at startup. Compare every address below
                    with the one shown on that machine before you sign. If they differ, type the address from your machine. A
                    wrong address links your license to someone else's node, and the license cannot be relinked for 24 hours.
                </div>
            </Alert>

            {licensesWithPendingRewards.length > 0 && (
                <Alert color="danger" classNames={{ base: 'items-start' }} title="Claim your rewards first">
                    <div className="text-sm">
                        {licensesWithPendingRewards.length} license{licensesWithPendingRewards.length > 1 ? 's have' : ' has'}{' '}
                        unclaimed rewards. Use Claim all for both PoA and PoAI rewards in{' '}
                        <Link to={routePath.licenses} className="font-medium underline">
                            Licenses & Nodes
                        </Link>
                        , then come back to relink.
                    </div>
                </Alert>
            )}

            <div className="col gap-3">
                {items.map(({ license, newNodeAddress }) => (
                    <div key={itemKey(license)} className="col gap-1.5 rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                            <span className="font-medium whitespace-nowrap">
                                {license.type} #{Number(license.licenseId)}
                            </span>
                            <span className="truncate font-mono text-[13px] text-slate-500">Old: {license.nodeAddress}</span>
                        </div>

                        <Input
                            id={`relink-${itemKey(license)}`}
                            aria-label={`New node address for ${license.type} #${Number(license.licenseId)}`}
                            value={getValue(license, newNodeAddress)}
                            onValueChange={(value) =>
                                setEdited((previous) => ({ ...previous, [itemKey(license)]: value.trim() }))
                            }
                            isInvalid={!!getError(license, newNodeAddress)}
                            errorMessage={getError(license, newNodeAddress)}
                            placeholder="0x"
                            variant="bordered"
                            size="sm"
                            classNames={{ input: 'font-mono text-[13px]' }}
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <Button color="primary" onPress={onRelink} isLoading={isSubmitting} isDisabled={!canRelink}>
                    Relink {items.length} license{items.length > 1 ? 's' : ''}
                </Button>
            </div>
        </div>
    );
}

export default RelinkNodes;
