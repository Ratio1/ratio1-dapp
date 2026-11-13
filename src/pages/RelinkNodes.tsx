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

// As in the link modal: a license last claimed in an earlier epoch is claimed again (even with zero
// rewards) before it is linked, since the contract only unlinks a license claimed in the current epoch.
const needsGhostClaim = (license: License) => license.isLinked && Number(license.lastClaimEpoch) < getCurrentEpoch();

function RelinkNodes() {
    const { watchTx, licenses, isLoadingLicenses, fetchLicenses } = useBlockchainContext() as BlockchainContextType;
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const items = useNodeKeyRotations(licenses);
    // Address typed for each license; missing means the announced one (or none).
    const [edited, setEdited] = useState<Record<string, string>>({});
    // Unclaimed PoA rewards of each license; missing while loading.
    const [poaRewards, setPoaRewards] = useState<Record<string, bigint | undefined>>({});
    const [isSubmitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (authenticated && !!address && publicClient) {
            fetchLicenses();
        }
    }, [authenticated, address, publicClient]);

    useEffect(() => {
        let isCancelled = false;
        Promise.all(items.map(({ license }) => (license.isLinked ? license.rewards : Promise.resolve(0n)))).then((values) => {
            if (!isCancelled) {
                setPoaRewards(Object.fromEntries(items.map(({ license }, index) => [itemKey(license), values[index]])));
            }
        });
        return () => {
            isCancelled = true;
        };
    }, [items]);

    const getValue = (item: { license: License; newNodeAddress?: EthAddress }) =>
        edited[itemKey(item.license)] ?? item.newNodeAddress ?? '';

    // Licenses left empty are skipped.
    const selected = items.filter((item) => getValue(item) !== '');

    const getError = (item: { license: License; newNodeAddress?: EthAddress }): string | undefined => {
        const value = getValue(item);
        if (value === '') {
            return undefined;
        }
        if (!isAddress(value, { strict: false })) {
            return 'Enter a valid node ETH address';
        }
        if (value.toLowerCase() === item.license.nodeAddress.toLowerCase()) {
            return 'This is the old, revoked address';
        }
        if (selected.filter((other) => getValue(other).toLowerCase() === value.toLowerCase()).length > 1) {
            return 'The same address is entered for another license';
        }
        return undefined;
    };

    // Rewards the owner must claim first: job (PoAI) rewards of the old node address cannot be claimed after
    // the relink, and the link modal also asks for PoA rewards to be claimed first.
    const hasPendingRewards = (license: License) =>
        (poaRewards[itemKey(license)] ?? 0n) > 0n ||
        (license.type === 'ND' && (license.usdcPoaiRewards > 0n || license.r1PoaiRewards > 0n));

    const isLoadingRewards = selected.some(({ license }) => poaRewards[itemKey(license)] === undefined);
    const licensesWithPendingRewards = selected.filter(({ license }) => hasPendingRewards(license));
    const ghostClaimCount = selected.filter(({ license }) => needsGhostClaim(license)).length;
    const canRelink =
        selected.length > 0 &&
        !isLoadingRewards &&
        licensesWithPendingRewards.length === 0 &&
        selected.every((item) => !getError(item));

    // One zero-value claim transaction per contract for the licenses last claimed in an earlier epoch.
    const ghostClaim = async (claimLicenses: License[], isND: boolean) => {
        if (!publicClient || !walletClient || claimLicenses.length === 0) {
            return;
        }
        const claims = await Promise.all(
            claimLicenses.map(async (license) => {
                if (!license.isLinked) {
                    throw new Error('License is not linked to a node.');
                }
                const [fromEpoch, toEpoch, packedAvailabilities, ethSignatures] = await Promise.all([
                    license.fromEpoch,
                    license.toEpoch,
                    license.packedAvailabilities,
                    license.ethSignatures,
                ]);
                const computeParam = {
                    licenseId: license.licenseId,
                    nodeAddress: license.nodeAddress,
                    fromEpoch: BigInt(fromEpoch),
                    toEpoch: BigInt(toEpoch),
                    packedAvailabilities,
                };
                return { computeParam, ethSignatures };
            }),
        );
        const args = [
            claims.map(({ computeParam }) => computeParam),
            claims.map(({ ethSignatures }) => ethSignatures),
        ] as const;
        const txHash = isND
            ? await simulateAndWriteContract({
                  publicClient,
                  walletClient,
                  parameters: { address: config.ndContractAddress, abi: NDContractAbi, functionName: 'claimRewards', args },
              })
            : await simulateAndWriteContract({
                  publicClient,
                  walletClient,
                  parameters: { address: config.mndContractAddress, abi: MNDContractAbi, functionName: 'claimRewards', args },
              });
        const receipt = await watchTx(txHash, publicClient);
        if (receipt?.status !== 'success') {
            throw new Error('Claiming failed, please try again.');
        }
    };

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

        const assignments = selected.map((item) => ({
            license: item.license,
            nodeAddress: getAddress(getValue(item)),
        }));
        const ndAssignments = assignments.filter(({ license }) => license.type === 'ND');
        const otherAssignments = assignments.filter(({ license }) => license.type !== 'ND');

        setSubmitting(true);
        try {
            await ghostClaim(ndAssignments.map(({ license }) => license).filter(needsGhostClaim), true);
            await ghostClaim(otherAssignments.map(({ license }) => license).filter(needsGhostClaim), false);

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

            for (const { license, nodeAddress } of otherAssignments) {
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
                    description="Licenses linked to revoked node keys will be displayed here"
                    icon={<RiCpuLine />}
                />
            </div>
        );
    }

    return (
        <div className="col w-full gap-4">
            <Alert color="warning" classNames={{ base: 'items-start' }} title="Check every address on your machine">
                <div className="text-sm">
                    A node whose key was revoked creates a new key and prints its new ETH address at startup. Compare every
                    prefilled address below with the one shown on that machine before you sign, and type the address from the
                    machine where it differs or none is prefilled. A wrong address links your license to someone else's node,
                    and the license cannot be relinked for 24 hours.
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

            {licensesWithPendingRewards.length === 0 && ghostClaimCount > 0 && (
                <Alert color="primary" classNames={{ base: 'items-start' }} title="Additional confirmation required">
                    <div className="text-sm">
                        You'll first approve a claim transaction for {ghostClaimCount} license{ghostClaimCount > 1 ? 's' : ''}{' '}
                        last claimed in a previous epoch.
                    </div>
                </Alert>
            )}

            <div className="col gap-3">
                {items.map((item) => (
                    <div key={itemKey(item.license)} className="col gap-1.5 rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                            <span className="font-medium whitespace-nowrap">
                                {item.license.type} #{Number(item.license.licenseId)}
                            </span>
                            <span className="truncate font-mono text-[13px] text-slate-500">
                                Old: {item.license.nodeAddress}
                            </span>
                        </div>

                        <Input
                            id={`relink-${itemKey(item.license)}`}
                            aria-label={`New node address for ${item.license.type} #${Number(item.license.licenseId)}`}
                            value={getValue(item)}
                            onValueChange={(value) =>
                                setEdited((previous) => ({ ...previous, [itemKey(item.license)]: value.trim() }))
                            }
                            isInvalid={!!getError(item)}
                            errorMessage={getError(item)}
                            description={
                                item.newNodeAddress
                                    ? undefined
                                    : 'No new key announced yet. Type the address shown on the machine, or leave empty to skip.'
                            }
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
                    Relink {selected.length} license{selected.length === 1 ? '' : 's'}
                </Button>
            </div>
        </div>
    );
}

export default RelinkNodes;
