import { Button } from '@heroui/button';
import { Form } from '@heroui/form';
import { Skeleton } from '@heroui/skeleton';
import { addReferralCode, getSellerCode } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { routePath } from '@lib/routes/route-paths';
import { DetailsCard } from '@shared/cards/DetailsCard';
import { ClosableToastContent } from '@shared/ClosableToastContent';
import { CopyableLink } from '@shared/CopyableLink';
import { CopyableValue } from '@shared/CopyableValue';
import StyledInput from '@shared/form/StyledInput';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiCoupon2Line } from 'react-icons/ri';
import ProfileSectionWrapper from '../ProfileSectionWrapper';

export default function Referrals() {
    const { account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;

    if (!account) {
        return null;
    }

    const [value, setValue] = useState<string>('');
    const [isApplying, setApplying] = useState<boolean>(false);

    const { data, isLoading: isLoadingSellerCode } = useQuery({
        queryKey: ['sellerCode'],
        queryFn: async () => {
            try {
                const response = await getSellerCode();

                if (!response) {
                    console.log('No seller code found for account.');
                    return null;
                }

                return response;
            } catch (error) {
                toast.error('Error fetching seller code.');
                return null;
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        apply(value);
    };

    const apply = async (value: string) => {
        setApplying(true);

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
            setApplying(false);
        }
    };

    return (
        <ProfileSectionWrapper>
            {/* Your Referrals */}
            <div className="col gap-2">
                <div className="section-title">Your Referrals</div>

                {isLoadingSellerCode ? (
                    <Skeleton className="h-[72px] w-full rounded-xl" />
                ) : !data ? (
                    <DetailsCard>
                        <div className="compact">
                            You can contact us to obtain your own referral code at{' '}
                            <a href="mailto:contact@ratio1.ai" className="text-primary hover:opacity-70">
                                contact@ratio1.ai
                            </a>
                        </div>
                    </DetailsCard>
                ) : (
                    <DetailsCard>
                        <div className="col gap-2">
                            <div className="row justify-between">
                                <div className="text-sm font-medium text-slate-700">Your code</div>
                                <CopyableValue value={data} size={8} />
                            </div>

                            <div className="row justify-between text-sm">
                                <div className="font-medium text-slate-700">Link for sharing</div>
                                <CopyableLink value={`${window.location.origin}${routePath.profile}?referral=${data}`} />
                            </div>
                        </div>
                    </DetailsCard>
                )}
            </div>

            {/* Referral Code */}
            <div className="col gap-2">
                <div className="section-title">Referral Code</div>

                <DetailsCard>
                    <div className="flex w-full items-center justify-between">
                        {!account.referral ? (
                            <Form className="w-full" validationBehavior="native" onSubmit={onSubmit}>
                                <div className="col w-full gap-4">
                                    <div className="flex w-full gap-2">
                                        <StyledInput
                                            id="referralCode"
                                            name="referralCode"
                                            type="text"
                                            value={value}
                                            onValueChange={setValue}
                                            labelPlacement="outside"
                                            placeholder="Code"
                                            isDisabled={isApplying}
                                        />

                                        <div className="flex">
                                            <Button color="primary" className="rounded-lg" isLoading={isApplying} type="submit">
                                                <div className="compact">Apply</div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        ) : (
                            <div className="compact">
                                This is the referral code applied to your account:{' '}
                                <span className="text-primary">{account.referral}</span>
                            </div>
                        )}
                    </div>
                </DetailsCard>
            </div>
        </ProfileSectionWrapper>
    );
}
