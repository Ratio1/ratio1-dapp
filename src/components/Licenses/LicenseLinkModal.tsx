import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Spinner } from '@nextui-org/spinner';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { RiWalletLine } from 'react-icons/ri';
import { License } from 'types';

interface Props {
    nodeAddresses: string[];
}

const LicenseLinkModal = forwardRef(({ nodeAddresses }: Props, ref) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [license, setLicense] = useState<License>();

    const [address, setAddress] = useState('');

    const trigger = (license: License) => {
        setLicense(license);
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    const onSubmit = (e) => {
        e.preventDefault();
        console.log('submit');
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
                                            onValueChange={setAddress}
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

                                        <Alert
                                            color="primary"
                                            title="A license can only be linked once every 24 hours."
                                            classNames={{
                                                base: 'items-center',
                                            }}
                                        />
                                    </div>

                                    <div className="flex w-full justify-end py-2">
                                        <Button type="submit" color="primary">
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
