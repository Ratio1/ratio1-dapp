import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import useAwait from '@lib/useAwait';
import { DetailedAlert } from '@shared/DetailedAlert';
import { R1ValueWithLabel } from '@shared/R1ValueWithLabel';
import { TokenSvg } from '@shared/TokenSvg';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiLinkUnlink } from 'react-icons/ri';
import { License } from 'typedefs/blockchain';
import { formatUnits, TransactionReceipt } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

interface Props {
    onClaim: (license: License, skipFetchingRewards?: boolean) => Promise<TransactionReceipt | undefined>;
    shouldTriggerGhostClaimRewards: (license: License) => boolean;
}

const LicenseUnlinkModal = forwardRef(({ onClaim, shouldTriggerGhostClaimRewards }: Props, ref) => {
    const [isLoading, setLoading] = useState<boolean>(false);

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [license, setLicense] = useState<License>();

    const rewardsPromise = useMemo(() => {
        if (!license) {
            return 0n;
        } else {
            return license.isLinked ? license.rewards : 0n;
        }
    }, [license]);
    const [rewards, isLoadingRewards] = useAwait(rewardsPromise);

    const { watchTx, fetchLicenses } = useBlockchainContext() as BlockchainContextType;
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const trigger = (license: License) => {
        setLoading(false);
        setLicense(license);
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    const onConfirmUnlinking = async () => {
        if (!walletClient || !license) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setLoading(true);

        const unlink = async () => {
            const unlinkTxHash = await walletClient.writeContract({
                address: license.type === 'ND' ? config.ndContractAddress : config.mndContractAddress,
                abi: license.type === 'ND' ? NDContractAbi : MNDContractAbi,
                functionName: 'unlinkNode',
                args: [license.licenseId],
            });

            await watchTx(unlinkTxHash, publicClient);
        };

        try {
            if (shouldTriggerGhostClaimRewards(license)) {
                const receipt = await onClaim(license, true);

                if (receipt?.status !== 'success') {
                    toast.error('Claiming rewards failed, please try again.');
                    throw new Error('Claiming rewards failed');
                }
            }

            await unlink();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Unexpected error, please try again.');
        } finally {
            console.log('Node unlinked, fetching licenses');

            // Using a timeout here to make sure fetchLicenses returns the updated smart contract data
            setTimeout(() => {
                fetchLicenses(true);
                setLoading(false);
            }, 500);
        }
    };

    const onConfirmClaiming = async () => {
        if (!license) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setLoading(true);

        try {
            await onClaim(license);
        } catch (error) {
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
            onClose();
        }
    };

    const getUnlinkingContent = () => (
        <>
            <div className="col w-full gap-6">
                <DetailedAlert
                    variant="red"
                    icon={<RiLinkUnlink />}
                    title="Unlinking confirmation"
                    description={<div>Are you sure you want to unlink this license?</div>}
                >
                    {!!license && shouldTriggerGhostClaimRewards(license) && (
                        <div className="text-slate-400 layoutBreak:px-6">
                            You'll need to approve <span className="font-medium text-primary">two transactions</span> because
                            rewards were last claimed in a previous epoch.
                        </div>
                    )}
                </DetailedAlert>

                <Alert
                    color="primary"
                    title="A license can only be linked once every 24 hours."
                    classNames={{
                        base: 'items-center',
                    }}
                />
            </div>

            <div className="row w-full justify-end gap-2 py-2">
                <Button onPress={onClose} isDisabled={isLoading}>
                    Cancel
                </Button>

                <Button className="bg-red-600" color="danger" onPress={onConfirmUnlinking} isLoading={isLoading}>
                    Unlink
                </Button>
            </div>
        </>
    );

    const getClaimRewardsContent = () => (
        <>
            <div className="col w-full gap-6">
                <DetailedAlert
                    icon={<TokenSvg classNames="h-8 w-8 " />}
                    title="Unavailable"
                    description={<div>Rewards must be claimed before unlinking license.</div>}
                >
                    <R1ValueWithLabel
                        label="Unclaimed Rewards"
                        value={parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(2))}
                        isAproximate
                    />
                </DetailedAlert>
            </div>

            <div className="row w-full justify-end gap-2 py-2">
                <Button color="primary" onPress={onConfirmClaiming} isLoading={isLoading}>
                    Claim
                </Button>
            </div>
        </>
    );

    return (
        <div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" shouldBlockScroll={false}>
                <ModalContent>
                    {!license || isLoadingRewards || rewards === undefined ? (
                        <Spinner />
                    ) : (
                        <>
                            <ModalHeader>Unlink License #{Number(license.licenseId)}</ModalHeader>

                            <ModalBody>{rewards > 0n ? getClaimRewardsContent() : getUnlinkingContent()}</ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
});

export default LicenseUnlinkModal;
