import { addReferralCode } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Button } from '@nextui-org/button';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Card } from '@shared/Card';
import { ClosableToastContent } from '@shared/ClosableToastContent';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiCoupon2Line, RiInformationLine } from 'react-icons/ri';

function ReferralCodeCard() {
    const { account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;

    const [value, setValue] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        apply(value);
    };

    const apply = async (value: string) => {
        setLoading(true);

        try {
            await addReferralCode(value);

            toast(
                (t) => (
                    <ClosableToastContent toastId={t.id} variant="success" icon={<RiCoupon2Line />}>
                        <div className="col gap-1 text-sm">
                            <div>Referral code successfully applied to your account.</div>
                        </div>
                    </ClosableToastContent>
                ),
                {
                    position: 'top-center',
                    duration: 5000,
                    style: {
                        width: '486px',
                        maxWidth: '96vw',
                        margin: '1rem',
                    },
                },
            );

            fetchAccount(); // Refresh account data after applying the code
        } catch (error: any) {
            console.error(error.message);

            if (error.message.includes('own')) {
                toast.error('Cannot apply your own code.');
            } else {
                toast.error('Error applying code, please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return null;
    }

    return (
        <Card icon={<RiCoupon2Line />} title="Referral Code">
            <div className="flex h-full w-full items-center justify-between">
                {!account.referral ? (
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
                            This is the referral code you used when you registered:{' '}
                            <span className="text-primary">{account.referral}</span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

export default ReferralCodeCard;
