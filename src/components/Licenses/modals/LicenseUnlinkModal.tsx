import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import useAwait from '@lib/useAwait';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Spinner } from '@nextui-org/spinner';
import { DetailedAlert } from '@shared/DetailedAlert';
import { R1ValueWithLabel } from '@shared/R1ValueWithLabel';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCurrencyLine, RiLinkUnlink } from 'react-icons/ri';
import { License } from 'typedefs/blockchain';
import { formatUnits } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

interface Props {
    onClaim: (license: License) => Promise<void>;
}

const LicenseUnlinkModal = forwardRef(({ onClaim }: Props, ref) => {
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

        try {
            const txHash = await walletClient.writeContract({
                address: license.type === 'ND' ? config.ndContractAddress : config.mndContractAddress,
                abi: license.type === 'ND' ? NDContractAbi : MNDContractAbi,
                functionName: 'unlinkNode',
                args: [license.licenseId],
            });

            await watchTx(txHash, publicClient);
            fetchLicenses();
            onClose();
        } catch (error) {
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
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
            // Claiming should also fetch licenses
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
                />

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
                    icon={<RiCurrencyLine />}
                    title="Unlinking unavailable"
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
