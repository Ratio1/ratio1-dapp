import { registerEmail } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Button } from '@nextui-org/button';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/modal';
import { Switch } from '@nextui-org/switch';
import { Card } from '@shared/Card';
import { DetailedAlert } from '@shared/DetailedAlert';
import { Label } from '@shared/Label';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiMailLine, RiMailSendLine } from 'react-icons/ri';

function RegistrationCard({ getRegistrationStatus }: { getRegistrationStatus: () => RegistrationStatus }) {
    const { account, setAccount } = useAuthenticationContext() as AuthenticationContextType;

    const [email, setEmail] = useState<string>('');
    const [isSelected, setSelected] = useState(true);

    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Confirmation email

    const [isLoading, setLoading] = useState<boolean>(false);
    const [isEmailResent, setEmailResent] = useState<boolean>(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        register(email, isSelected);
    };

    const register = async (email: string, receiveUpdates: boolean) => {
        setLoading(true);

        try {
            const accountResponse: ApiAccount = await registerEmail({ email, receiveUpdates });
            setAccount(accountResponse);

            onOpen();
        } catch (error: any) {
            console.error(error);

            if (error.message && error.message.includes('already used')) {
                toast.error('This email address is already registered to another wallet.');
            } else if (error.message && error.message.includes('inactive')) {
                toast.error('Invalid email address.');
            } else {
                toast.error('Unexpected error, please try again.');
            }
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
                label={
                    getRegistrationStatus() === RegistrationStatus.REGISTERED ? (
                        <Label text="Registered" variant="green" />
                    ) : getRegistrationStatus() === RegistrationStatus.NOT_CONFIRMED ? (
                        <Label text="Awaiting Confirmation" variant="yellow" />
                    ) : (
                        <Label text="Not Registered" />
                    )
                }
            >
                <div className="flex h-full w-full items-center justify-between">
                    {getRegistrationStatus() === RegistrationStatus.REGISTERED ? (
                        <div className="col gap-1">
                            <div className="text-sm font-medium text-slate-500">Email Address</div>
                            <div className="font-medium">{account.email}</div>
                        </div>
                    ) : (
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
                                        isDisabled={isLoading}
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
                                        isDisabled={isLoading}
                                    />
                                    <div className="text-sm font-medium text-slate-700">
                                        Subscribe to receive updates on email
                                    </div>
                                </div>
                            </div>
                        </Form>
                    )}
                </div>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="lg">
                <ModalContent>
                    {() => (
                        <>
                            <ModalBody>
                                <div className="col pb-6 pt-2">
                                    <DetailedAlert
                                        icon={<RiMailSendLine />}
                                        title="Email Confirmation"
                                        description={
                                            <div>
                                                We've sent an email to{' '}
                                                <span className="text-primary">{account.pendingEmail || email}</span>. Please
                                                follow the link inside the confirmation email to confirm your address.
                                            </div>
                                        }
                                    />

                                    <div className="center-all">
                                        <Button
                                            color="primary"
                                            variant="solid"
                                            isLoading={isLoading}
                                            isDisabled={isEmailResent}
                                            onPress={async () => {
                                                await register(account.pendingEmail, account.receiveUpdates);
                                                setEmailResent(true);
                                                toast.success('Confirmation email resent.');
                                            }}
                                        >
                                            <div className="text-base">Resend email</div>
                                        </Button>
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default RegistrationCard;
