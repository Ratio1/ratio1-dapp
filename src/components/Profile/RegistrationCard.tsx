import { registerEmail } from '@lib/api/backend';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/modal';
import { Switch } from '@nextui-org/switch';
import { Card } from '@shared/Card';
import { DetailedAlert } from '@shared/DetailedAlert';
import { Label } from '@shared/Label';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiMailLine, RiMailSendLine } from 'react-icons/ri';

function RegistrationCard({
    account,
    getRegistrationStatus,
    fetchAccount,
    setAccount,
}: {
    account?: ApiAccount;
    getRegistrationStatus: () => RegistrationStatus;
    fetchAccount: (options?: RefetchOptions) => Promise<QueryObserverResult<ApiAccount, Error>>;
    setAccount: React.Dispatch<React.SetStateAction<ApiAccount | undefined>>;
}) {
    const [email, setEmail] = useState<string>('');
    const [isSelected, setSelected] = useState(true);

    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Confirmation email

    const [isLoading, setLoading] = useState<boolean>(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log('Register', email, isSelected);

        setLoading(true);

        try {
            const accountResponse: ApiAccount = await registerEmail({ email, receiveUpdates: isSelected });
            setAccount(accountResponse);

            onOpen();
        } catch (error) {
            console.error('Error', error);
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return null;
    }

    return (
        <>
            <Card
                icon={<RiMailLine />}
                title="Registration"
                label={getRegistrationStatus() === RegistrationStatus.NOT_REGISTERED ? <Label text="Not Registered" /> : <></>}
            >
                <div className="flex h-full w-full items-center justify-between">
                    {getRegistrationStatus() === RegistrationStatus.NOT_REGISTERED && (
                        <Form className="w-full" validationBehavior="native" onSubmit={onSubmit}>
                            <div className="col w-full gap-4">
                                <div className="flex w-full gap-2">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onValueChange={setEmail}
                                        size="md"
                                        classNames={{
                                            inputWrapper: 'bg-[#fcfcfd] border rounded-lg',
                                            input: 'font-medium rounded-lg',
                                        }}
                                        variant="bordered"
                                        color="primary"
                                        labelPlacement="outside"
                                        placeholder="Email"
                                        disabled={isLoading}
                                    />

                                    <div className="flex">
                                        <Button color="primary" className="rounded-lg" isLoading={isLoading} type="submit">
                                            <div className="text-sm font-medium">Register</div>
                                        </Button>
                                    </div>
                                </div>

                                <div className="row gap-2">
                                    <Switch
                                        isSelected={isSelected}
                                        onValueChange={setSelected}
                                        size="sm"
                                        disabled={isLoading}
                                    />
                                    <div className="text-sm font-medium text-slate-700">
                                        Subscribe to receive updates on email
                                    </div>
                                </div>
                            </div>
                        </Form>
                    )}

                    {getRegistrationStatus() === RegistrationStatus.NOT_CONFIRMED && (
                        <div>
                            <Alert
                                color="warning"
                                // title="Please confirm your email"
                                description={
                                    <div>
                                        We've sent a confirmation email to{' '}
                                        <span className="font-semibold">{account.pendingEmail || email}</span>. Please follow
                                        the link inside the email to confirm your address.
                                    </div>
                                }
                                classNames={{
                                    base: 'items-center',
                                }}
                            />
                        </div>
                    )}
                </div>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="lg">
                <ModalContent>
                    {() => (
                        <>
                            <ModalBody>
                                <DetailedAlert
                                    icon={<RiMailSendLine />}
                                    title="Email Confirmation"
                                    description={
                                        <div>
                                            We've sent a confirmation email to <span className="text-primary">{email}</span>.
                                            Please follow the link inside the email to confirm your address.
                                        </div>
                                    }
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default RegistrationCard;
