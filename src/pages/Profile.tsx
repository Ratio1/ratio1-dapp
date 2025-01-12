import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Switch } from '@nextui-org/switch';
import { useState } from 'react';
import { RiMailLine, RiNewsLine, RiUserFollowLine } from 'react-icons/ri';

function Profile() {
    const [email, setEmail] = useState<string>('');

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col justify-between gap-6 rounded-3xl bg-lightAccent px-10 py-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary p-2 text-white">
                                <RiMailLine className="text-xl" />
                            </div>

                            <div className="text-xl font-bold leading-6">Registration</div>
                        </div>

                        <div className="rounded-md bg-red-100 px-2 py-1 text-sm font-medium tracking-wider text-red-700">
                            Not Registered
                        </div>
                    </div>

                    <div className="flex w-full items-center gap-2">
                        <Input
                            id="email"
                            name="email"
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

                        <Button color="primary" className="rounded-lg">
                            <div className="text-sm font-medium">Register</div>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[#e3e4e8] bg-light">
                    <div className="bg-lightAccent px-10 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary p-2 text-white">
                                    <RiUserFollowLine className="text-xl" />
                                </div>

                                <div className="text-xl font-bold leading-6">KYC</div>
                            </div>

                            <div className="rounded-md bg-red-100 px-2 py-1 text-sm font-medium tracking-wider text-red-700">
                                Not Started
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-10 py-6">
                        <Alert
                            color="primary"
                            title="You need to register and confirm your email first."
                            classNames={{
                                base: 'items-center',
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[#e3e4e8] bg-light">
                    <div className="bg-lightAccent px-10 py-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary p-2 text-white">
                                <RiNewsLine className="text-xl" />
                            </div>

                            <div className="text-xl font-bold leading-6">Subscription</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-10 py-6">
                        <div>Subscribe to email updates.</div>

                        <Switch defaultSelected={true} size="sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
