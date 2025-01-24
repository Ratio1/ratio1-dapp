import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/modal';
import { Switch } from '@nextui-org/switch';
import { Card } from '@shared/Card';
import { useState } from 'react';
import { RiMailLine, RiMailSendLine, RiNewsLine, RiUserFollowLine, RiWalletLine } from 'react-icons/ri';
import { useAccount } from 'wagmi';

function Profile() {
    const [email, setEmail] = useState<string>('');
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [isLoading, setLoading] = useState<boolean>(false);

    const [isRegistered] = useState<boolean>(true);

    const { isConnected } = useAccount();

    const register = () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            onOpen();
        }, 300);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        console.log('register');
        register();
    };

    return (
        <div className="col w-full gap-6">
            {!isConnected ? (
                <div className="center-all col gap-6 p-6">
                    <div className="center-all rounded-full bg-primary-50 p-6">
                        <RiWalletLine className="text-4xl text-primary-300" />
                    </div>

                    <div className="col gap-1 text-center">
                        <div className="font-bold uppercase tracking-wider text-primary-800">Connect Wallet</div>

                        <div className="text-slate-400">
                            To proceed, please connect your wallet so we can identify and display your profile.
                        </div>

                        <div className="mx-auto pt-4">
                            <appkit-connect-button />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                        <Card
                            icon={<RiMailLine />}
                            title="Registration"
                            label={
                                !isRegistered ? (
                                    <div className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium tracking-wider text-red-700 lg:text-sm">
                                        Not Registered
                                    </div>
                                ) : (
                                    <></>
                                )
                            }
                        >
                            {/* TODO: If registered display email without controls */}
                            <div className="flex h-full w-full items-center justify-between">
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
                                            />

                                            <div className="flex">
                                                <Button
                                                    color="primary"
                                                    className="rounded-lg"
                                                    isLoading={isLoading}
                                                    type="submit"
                                                >
                                                    <div className="text-sm font-medium">Register</div>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="row gap-2">
                                            <Switch defaultSelected={true} size="sm" />
                                            <div className="text-sm font-medium">Subscribe to receive updates on email</div>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </Card>

                        <Card
                            icon={<RiUserFollowLine />}
                            title="KYC"
                            label={
                                <div className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium tracking-wider text-red-700 lg:text-sm">
                                    Not Started
                                </div>
                            }
                        >
                            <div className="row h-full justify-between">
                                <Alert
                                    color="primary"
                                    title="You need to register and confirm your email first."
                                    classNames={{
                                        base: 'items-center',
                                    }}
                                />
                            </div>
                        </Card>

                        {isRegistered && (
                            <Card icon={<RiNewsLine />} title="Subscription">
                                <div className="row justify-between">
                                    <div>Send me email updates.</div>
                                    <Switch defaultSelected={true} size="sm" />
                                </div>
                            </Card>
                        )}
                    </div>

                    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="lg">
                        <ModalContent>
                            {() => (
                                <>
                                    <ModalBody>
                                        <div className="col gap-6 px-4 py-8">
                                            <div className="center-all">
                                                <div className="center-all rounded-full bg-primary-50 p-6">
                                                    <RiMailSendLine className="text-4xl text-primary-300" />
                                                </div>
                                            </div>

                                            <div className="col gap-1 text-center">
                                                <div className="font-bold uppercase tracking-wider text-primary-800">
                                                    Email Confirmation
                                                </div>

                                                <div className="text-slate-400">
                                                    We've sent a confirmation email to{' '}
                                                    <span className="text-primary">{email}</span>. Please follow the link inside
                                                    the email to confirm your address.
                                                </div>
                                            </div>
                                        </div>
                                    </ModalBody>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </>
            )}
        </div>
    );
}

export default Profile;
