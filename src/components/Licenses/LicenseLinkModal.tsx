import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { mndContractAddress, ndContractAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Spinner } from '@nextui-org/spinner';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import toast from 'react-hot-toast';
import { RiWalletLine } from 'react-icons/ri';
import { EthAddress, License } from 'typedefs/blockchain';
import { usePublicClient, useWalletClient } from 'wagmi';

interface Props {
    nodeAddresses: string[];
    getLicenses: () => void;
}

const LicenseLinkModal = forwardRef(({ nodeAddresses, getLicenses }: Props, ref) => {
    const [isLoading, setLoading] = useState<boolean>(false);

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [license, setLicense] = useState<License>();

    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const [address, setAddress] = useState('');

    const [isNodeAlreadyLinked, setNodeAlreadyLinked] = useState<boolean>(false);

    // Init
    useEffect(() => {
        setLoading(false);
        setAddress('');
    }, []);

    const trigger = (license: License) => {
        setLicense(license);
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!walletClient || !license || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setLoading(true);

        const isAlreadyLinked: boolean = await publicClient.readContract({
            address: ndContractAddress,
            abi: NDContractAbi,
            functionName: 'isNodeAlreadyLinked',
            args: [address as EthAddress],
        });

        if (isAlreadyLinked) {
            setNodeAlreadyLinked(true);
            setLoading(false);
            return;
        }

        const txHash = await walletClient.writeContract({
            address: license.type === 'ND' ? ndContractAddress : mndContractAddress,
            abi: license.type === 'ND' ? NDContractAbi : MNDContractAbi,
            functionName: 'linkNode',
            args: [license.licenseId, address as EthAddress],
        });

        await watchTx(txHash, publicClient);

        setAddress('');
        getLicenses();
        setLoading(false);
        onClose();
    };

    return (
        <div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" shouldBlockScroll={false}>
                <ModalContent>
                    {!license ? (
                        <Spinner />
                    ) : (
                        <>
                            <ModalHeader>Link License #{Number(license.licenseId)}</ModalHeader>

                            <ModalBody>
                                <Form className="w-full" validationBehavior="native" onSubmit={onSubmit}>
                                    <div className="col w-full gap-3">
                                        <Input
                                            value={address}
                                            onValueChange={(value: string) => {
                                                if (isNodeAlreadyLinked) {
                                                    setNodeAlreadyLinked(false);
                                                }

                                                setAddress(value);
                                            }}
                                            label="Node Address"
                                            labelPlacement="outside"
                                            placeholder="0x"
                                            startContent={
                                                <RiWalletLine className="pointer-events-none text-xl text-slate-500" />
                                            }
                                            size="md"
                                            classNames={{
                                                inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                                                input: 'font-medium',
                                            }}
                                            type="text"
                                            variant="bordered"
                                            validate={(value) => {
                                                if (!(value.startsWith('0x') && value.length === 42)) {
                                                    return 'Value must be a valid Ethereum address';
                                                }

                                                if (nodeAddresses.includes(value)) {
                                                    return 'This address is already linked to another license';
                                                }

                                                return null;
                                            }}
                                        />

                                        {isNodeAlreadyLinked ? (
                                            <Alert
                                                color="danger"
                                                title="This address is already linked to another license."
                                                classNames={{
                                                    base: 'items-center',
                                                }}
                                            />
                                        ) : (
                                            <Alert
                                                color="primary"
                                                title="A license can only be linked once every 24 hours."
                                                classNames={{
                                                    base: 'items-center',
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="flex w-full justify-end py-2">
                                        <Button type="submit" color="primary" isLoading={isLoading}>
                                            Confirm
                                        </Button>
                                    </div>
                                </Form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
});

export default LicenseLinkModal;
