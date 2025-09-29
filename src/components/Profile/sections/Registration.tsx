import { Button } from '@heroui/button';
import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/modal';
import { Switch } from '@heroui/switch';
import { registerEmail } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DetailsCard } from '@shared/cards/DetailsCard';
import { DetailedAlert } from '@shared/DetailedAlert';
import { Label } from '@shared/Label';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiMailSendLine } from 'react-icons/ri';
import ProfileSectionWrapper from '../ProfileSectionWrapper';

export default function Registration({ registrationStatus }: { registrationStatus: RegistrationStatus }) {
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
        <ProfileSectionWrapper>
            <div className="col gap-2">
                <div className="row gap-2">
                    <div className="section-title">Registration</div>

                    {registrationStatus === RegistrationStatus.REGISTERED ? (
                        <Label text="Registered" variant="green" />
                    ) : registrationStatus === RegistrationStatus.NOT_CONFIRMED ? (
                        <Label text="Awaiting Confirmation" variant="yellow" />
                    ) : (
                        <Label text="Not Registered" />
                    )}
                </div>

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
                                    inputWrapper: 'bg-[#fcfcfd] border rounded-lg shadow-none',
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
                            <Switch isSelected={isSelected} onValueChange={setSelected} size="sm" isDisabled={isLoading} />
                            <div className="text-sm font-medium text-slate-700">Subscribe to receive updates on email</div>
                        </div>
                    </div>
                </Form>

                <div className="pt-2">
                    <DetailsCard>
                        <div className="compact">
                            You need to register and confirm your email address to be able to start the{' '}
                            <span className="text-primary">KYC/KYB</span> process
                        </div>
                    </DetailsCard>
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="lg"
                classNames={{
                    closeButton: 'cursor-pointer',
                }}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalBody>
                                <div className="col pt-2 pb-6">
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
        </ProfileSectionWrapper>
    );
}
