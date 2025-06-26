import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { DetailedAlert } from '@shared/DetailedAlert';
import { forwardRef, useImperativeHandle, useState } from 'react';
import toast from 'react-hot-toast';
import { RiFireLine } from 'react-icons/ri';
import { License } from 'typedefs/blockchain';
import { usePublicClient, useWalletClient } from 'wagmi';

const LicenseBurnModal = forwardRef((_, ref) => {
    const [isLoading, setLoading] = useState<boolean>(false);

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [license, setLicense] = useState<License>();

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

    const onConfirm = async () => {
        if (!walletClient || !license) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setLoading(true);

        try {
            const txHash = await walletClient.writeContract({
                address: license.type === 'ND' ? config.ndContractAddress : config.mndContractAddress,
                abi: license.type === 'ND' ? NDContractAbi : MNDContractAbi,
                functionName: 'burn',
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

    return (
        <div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" shouldBlockScroll={false}>
                <ModalContent>
                    {!license ? (
                        <Spinner />
                    ) : (
                        <>
                            <ModalHeader>Burn License #{Number(license.licenseId)}</ModalHeader>

                            <ModalBody>
                                <div className="col w-full gap-6">
                                    <DetailedAlert
                                        variant="red"
                                        icon={<RiFireLine />}
                                        title="Warning"
                                        description={
                                            <div className="col">
                                                <div>Are you sure you want to burn this license?</div>

                                                <div>
                                                    The process is{' '}
                                                    <span className="text-medium text-red-500">irreversible</span>, and the
                                                    license will be <span className="text-medium text-red-500">unusable</span>{' '}
                                                    afterward.
                                                </div>
                                            </div>
                                        }
                                    />
                                </div>

                                <div className="row w-full justify-end gap-2 py-2">
                                    <Button onPress={onClose} isDisabled={isLoading}>
                                        Cancel
                                    </Button>

                                    <Button className="bg-red-600" color="danger" onPress={onConfirm} isLoading={isLoading}>
                                        Confirm
                                    </Button>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
});

export default LicenseBurnModal;
