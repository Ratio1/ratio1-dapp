import { getSellerCode } from '@lib/api/backend';
import { Card } from '@shared/Card';
import { CopyableLink } from '@shared/CopyableLink';
import { CopyableValue } from '@shared/CopyableValue';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { RiGroupLine, RiInformationLine } from 'react-icons/ri';

function YourReferralsCard() {
    const { data, isLoading } = useQuery({
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
    });

    return (
        <Card icon={<RiGroupLine />} title="Your Referrals">
            <div className="h-full w-full">
                {isLoading ? (
                    <></>
                ) : !data ? (
                    <div className="flex gap-1">
                        <RiInformationLine className="h-6 text-[22px]" />
                        <div>
                            You can contact us to obtain your own referral code at{' '}
                            <a href="mailto:contact@ratio1.ai" className="text-primary hover:opacity-70">
                                contact@ratio1.ai
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="col w-full gap-2 rounded-lg bg-primary-50 px-4 py-3.5">
                        <div className="row justify-between">
                            <div className="text-sm font-medium text-slate-700">Your code</div>
                            <CopyableValue value={data} size={7} />
                        </div>

                        <div className="row justify-between text-sm">
                            <div className="font-medium text-slate-700">Link for sharing</div>
                            <CopyableLink value={`${window.location.origin}?referral=${data}`} />
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

export default YourReferralsCard;
