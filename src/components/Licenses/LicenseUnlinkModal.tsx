import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { ndContractAddress, mndContractAddress } from '@lib/config';
import { useGeneralContext, GeneralContextType } from '@lib/general';
import useAwait from '@lib/useAwait';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Spinner } from '@nextui-org/spinner';
import { forwardRef, useImperativeHandle, useState } from 'react';
import toast from 'react-hot-toast';
import { RiLinkUnlink } from 'react-icons/ri';
import { EthAddress, License } from 'types';
import { useWalletClient, usePublicClient } from 'wagmi';

const LicenseUnlinkModal = forwardRef((_props, ref) => {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [license, setLicense] = useState<License>();
    const [rewards] = useAwait(license?.isLinked ? license.rewards : 0n);

    const { watchTx } = useGeneralContext() as GeneralContextType;
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const trigger = (license: License) => {
        //TODO this does not work as expected
        if (license.isLinked && (rewards ?? 0n) > 0n) {
            toast.error('Rewards must be claimed before unlinking license.', {
                position: 'top-center',
                style: {
                    minWidth: '426px',
                },
            });
            return;
        }

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

        const txHash = await walletClient.writeContract({
            address: license.type === 'ND' ? ndContractAddress : mndContractAddress,
            abi: license.type === 'ND' ? NDContractAbi : MNDContractAbi,
            functionName: 'unlinkNode',
            args: [license.licenseId],
        });
        await watchTx(txHash, publicClient);
    };

    return (
        <div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" shouldBlockScroll={false}>
                <ModalContent>
                    {!license ? (
                        <Spinner />
                    ) : (
                        <>
                            <ModalHeader>Unlink License #{Number(license.licenseId)}</ModalHeader>

                            <ModalBody>
                                <div className="col w-full gap-6">
                                    <div className="center-all col gap-6">
                                        <div className="center-all rounded-full bg-red-50 p-6">
                                            <RiLinkUnlink className="text-4xl text-red-400" />
                                        </div>

                                        <div className="col gap-1 text-center">
                                            <div className="font-bold uppercase tracking-wider text-primary-800">
                                                Confirm unlinking
                                            </div>

                                            <div className="text-slate-400">Are you sure you want to unlink this license?</div>
                                        </div>
                                    </div>

                                    <Alert
                                        color="primary"
                                        title="A license can only be linked once every 24 hours."
                                        classNames={{
                                            base: 'items-center',
                                        }}
                                    />
                                </div>

                                <div className="row w-full justify-end gap-2 py-2">
                                    <Button onPress={onClose}>Cancel</Button>

                                    <Button color="danger" onPress={onConfirm}>
                                        Unlink
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

export default LicenseUnlinkModal;
