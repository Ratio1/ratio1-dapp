import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { Switch } from '@heroui/switch';
import { emailSubscribe, emailUnsubscribe, getKycInfo, initSumsubSession } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { routePath } from '@lib/routes/route-paths';
import { getApplicationStatusInfo } from '@lib/utils';
import { DetailsCard } from '@shared/cards/DetailsCard';
import { Label } from '@shared/Label';
import ProfileRow from '@shared/ProfileRow';
import { ApiAccount } from '@typedefs/blockchain';
import { KycInfo } from '@typedefs/general';
import { ApplicationStatus } from '@typedefs/profile';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiInformation2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import ProfileSectionWrapper from '../ProfileSectionWrapper';

export default function PersonalInformation() {
    const { account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;
    const navigate = useNavigate();

    // Switches states
    const [isSubscribed, setSubscribed] = useState<boolean>(false);
    const [isCompany, setCompany] = useState<boolean>(false);

    const [isLoading, setLoading] = useState<boolean>(false);

    const [isFetchingKycInfo, setFetchingKycInfo] = useState<boolean>(false);
    const [kycInfo, setKycInfo] = useState<KycInfo | undefined>();

    const [applicationStatusInfo, setApplicationStatusInfo] = useState<
        { text: string; color: 'yellow' | 'green' | 'red' } | undefined
    >();

    // Init
    useEffect(() => {
        fetchAccount(); // Always refresh to get the KYC state
    }, []);

    useEffect(() => {
        if (account) {
            setSubscribed(account.receiveUpdates);
            setApplicationStatusInfo(getApplicationStatusInfo(account.kycStatus));

            if (account.kycStatus === ApplicationStatus.Approved) {
                fetchKycInfo();
            }
        }
    }, [account]);

    const fetchKycInfo = async () => {
        setFetchingKycInfo(true);

        try {
            const response = await getKycInfo();
            console.log('getKycInfo', response);
            setKycInfo(response);
        } catch (error) {
            console.error('Error', error);
            toast.error('An error occured while fetching your information.');
        } finally {
            setFetchingKycInfo(false);
        }
    };

    const toggleEmailSubscriptionPreference = async () => {
        if (isLoading) {
            return;
        }

        // We set the new value optimistically
        setSubscribed(!isSubscribed);

        const apiCall: () => Promise<ApiAccount> = isSubscribed ? emailUnsubscribe : emailSubscribe;

        try {
            const accountResponse = await apiCall();

            setSubscribed(accountResponse.receiveUpdates);
            toast.success('Subscription preference updated.');
        } catch (error) {
            console.error('Error', error);
            toast.error('Error updating preference, please try again.');
        }
    };

    const initializeApplication = async () => {
        setLoading(true);

        const type: 'individual' | 'company' = isCompany ? 'company' : 'individual';

        try {
            const tokenResponse: string = await initSumsubSession(type);

            if (!tokenResponse) {
                throw new Error('Unexpected error, please try again.');
            }

            navigate(`${routePath.kyc}?type=${type}&token=${tokenResponse}`);
        } catch (error) {
            console.error('Error', error);
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getKycInfoContent = () => {
        if (isFetchingKycInfo) {
            return <Skeleton className="h-[144px] w-full rounded-lg" />;
        } else if (!kycInfo) {
            return <div>No KYC information available.</div>;
        }

        return (
            <div className="col gap-4 sm:gap-1.5">
                <ProfileRow label="Name" value={kycInfo.name} />
                <ProfileRow label="Address" value={kycInfo.address} />
                <ProfileRow label="City" value={kycInfo.city} />
                <ProfileRow label="State" value={kycInfo.state} />
                <ProfileRow label="Country" value={kycInfo.country} />
            </div>
        );
    };

    const getContent = (
        account: ApiAccount,
        applicationStatusInfo: { text: string; color: 'yellow' | 'green' | 'red' },
        isInitiated: boolean,
    ) => {
        if (isInitiated) {
            if (account.kycStatus === ApplicationStatus.Init || account.kycStatus === ApplicationStatus.Rejected) {
                return (
                    <div className="col gap-4">
                        <div className="flex">
                            <ApplicationButton
                                label={`Continue ${applicationType}`}
                                isLoading={isLoading}
                                onPress={initializeApplication}
                            />
                        </div>

                        <ApplicationInfoText isCompany={account.applicantType === 'company'} />
                    </div>
                );
            } else {
                let content: React.ReactNode;

                switch (applicationStatusInfo.color) {
                    case 'green':
                        content = getKycInfoContent();
                        break;

                    case 'yellow':
                        content = `Your ${applicationType} submission has been received and is under review.`;
                        break;

                    case 'red':
                        content = `Your ${applicationType} submission has been rejected.`;
                        break;

                    default:
                        content = `The status of your ${applicationType} submission is unknown at this time.`;
                }

                return <div className="compact">{content}</div>;
            }
        } else {
            return (
                <div className="col items-center gap-4 sm:items-start">
                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between">
                        <div className="row compact justify-center gap-2 sm:justify-start">
                            <Label variant="blue" text="Individual" />
                            <Switch
                                isSelected={isCompany}
                                onValueChange={setCompany}
                                size="sm"
                                classNames={{
                                    wrapper: 'bg-blue-400 group-data-[selected=true]:bg-purple-400',
                                }}
                            />
                            <Label variant="purple" text="Company" />
                        </div>

                        <div className="center-all">
                            <ApplicationButton
                                label={`Start ${isCompany ? 'KYB' : 'KYC'}`}
                                isLoading={isLoading}
                                onPress={initializeApplication}
                            />
                        </div>
                    </div>

                    <ApplicationInfoText isCompany={isCompany} />
                </div>
            );
        }
    };

    if (!account || !applicationStatusInfo) {
        return null;
    }

    const applicationType = account.applicantType === 'company' ? 'KYB' : 'KYC';

    const isApplicationInitiated: boolean =
        getApplicationStatusInfo(account.kycStatus) !== undefined && account.kycStatus !== ApplicationStatus.Created;

    return (
        <ProfileSectionWrapper>
            {/* Account */}
            <div className="col gap-2">
                <div className="section-title">Account</div>

                <DetailsCard>
                    <div className="col gap-4 sm:gap-1.5">
                        <ProfileRow label="Email address" value={account.email} />

                        <ProfileRow label="VAT percentage" value={`${account.vatPercentage / 100}%`} />

                        <ProfileRow
                            label="Subscribe to email updates"
                            value={
                                <Switch isSelected={isSubscribed} onValueChange={toggleEmailSubscriptionPreference} size="sm" />
                            }
                        />
                    </div>
                </DetailsCard>
            </div>

            {/* KYC/KYB */}
            <div className="col gap-2">
                <div className="row gap-2">
                    <div className="section-title">{!kycInfo ? 'KYC/KYB' : `${kycInfo.isCompany ? 'KYB' : 'KYC'}`}</div>

                    {isApplicationInitiated && (
                        <Label
                            variant={
                                (
                                    getApplicationStatusInfo(account.kycStatus) as {
                                        text: string;
                                        color: 'yellow' | 'green' | 'red';
                                    }
                                ).color
                            }
                            text={
                                (
                                    getApplicationStatusInfo(account.kycStatus) as {
                                        text: string;
                                        color: 'yellow' | 'green' | 'red';
                                    }
                                ).text
                            }
                        />
                    )}
                </div>

                <DetailsCard>{getContent(account, applicationStatusInfo, isApplicationInitiated)}</DetailsCard>
            </div>
        </ProfileSectionWrapper>
    );
}

function ApplicationButton({ label, isLoading, onPress }: { label: string; isLoading: boolean; onPress: () => void }) {
    return (
        <Button color="primary" className="h-9" size="sm" variant="solid" isLoading={isLoading} onPress={onPress}>
            <div className="text-sm">{label}</div>
        </Button>
    );
}

function ApplicationInfoText({ isCompany }: { isCompany: boolean }) {
    return (
        <div className="flex items-start gap-1">
            <RiInformation2Line className="text-primary text-lg" />
            <div className="compact">
                You'll continue the {isCompany ? 'KYB' : 'KYC'} process using{' '}
                <span className="text-primary font-medium">Sumsub</span>
            </div>
        </div>
    );
}
