import { addReferralCode } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Button } from '@nextui-org/button';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Card } from '@shared/Card';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiGroupLine, RiInformationLine } from 'react-icons/ri';

function ReferralCard() {
    const { account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;

    const [value, setValue] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);

    // TODO: Replace with the property from account
    const [code, setCode] = useState<string>(); // 'FAE7C9D'

    const onSubmit = async (e) => {
        e.preventDefault();
        apply(value);
    };

    const apply = async (value: string) => {
        setLoading(true);

        try {
            console.log('Adding referral code:', value);
            const response = await addReferralCode(value);
            console.log('addReferralCode response', response);

            toast.success('Referral code added successfully.');
            fetchAccount(); // Refresh account data after applying the code
        } catch (error: any) {
            console.error(error);
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return null;
    }

    return (
        <Card icon={<RiGroupLine />} title="Referral">
            <div className="flex h-full w-full items-center justify-between">
                {!code ? (
                    <Form className="w-full" validationBehavior="native" onSubmit={onSubmit}>
                        <div className="col w-full gap-4">
                            <div className="flex w-full gap-2">
                                <Input
                                    id="referralCode"
                                    name="referralCode"
                                    type="text"
                                    value={value}
                                    onValueChange={setValue}
                                    size="md"
                                    classNames={{
                                        inputWrapper: 'bg-[#fcfcfd] border rounded-lg',
                                        input: 'font-medium rounded-lg',
                                    }}
                                    variant="bordered"
                                    color="primary"
                                    labelPlacement="outside"
                                    placeholder="Code"
                                    isDisabled={isLoading}
                                />

                                <div className="flex">
                                    <Button color="primary" className="rounded-lg" isLoading={isLoading} type="submit">
                                        <div className="text-sm font-medium">Apply</div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Form>
                ) : (
                    <div className="flex gap-1">
                        <RiInformationLine className="h-6 text-[22px]" />
                        <div>
                            This is the referral code you used when you registered: <span className="text-primary">{code}</span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

export default ReferralCard;
