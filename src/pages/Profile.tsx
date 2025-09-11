import ProfileSection from '@components/Profile/ProfileSection';
import ProfileSectionWrapper from '@components/Profile/ProfileSectionWrapper';
import PersonalInformation from '@components/Profile/sections/PersonalInformation';
import Referrals from '@components/Profile/sections/Referrals';
import Registration from '@components/Profile/sections/Registration';
import { Skeleton } from '@heroui/skeleton';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DetailedAlert } from '@shared/DetailedAlert';
import { RegistrationStatus } from '@typedefs/profile';
import { ConnectKitButton } from 'connectkit';
import { useEffect } from 'react';
import { RiCloseLargeLine, RiWalletLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';

function Profile() {
    const [searchParams] = useSearchParams();
    const referralCode = searchParams.get('referral');

    const { authenticated, account, isFetchingAccount, accountFetchError } =
        useAuthenticationContext() as AuthenticationContextType;

    useEffect(() => {
        if (referralCode) {
            // Store the referral code then clear the URL parameters
            localStorage.setItem('referralCode', referralCode);
            console.log('Referral code set in localStorage', referralCode);
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, document.title, url.toString());
        }
    }, [referralCode]);

    const getRegistrationStatus = (): RegistrationStatus => {
        if (account && account.email && account.emailConfirmed) {
            return RegistrationStatus.REGISTERED;
        }

        if (account && account.pendingEmail && !account.emailConfirmed) {
            return RegistrationStatus.NOT_CONFIRMED;
        }

        return RegistrationStatus.NOT_REGISTERED;
    };

    if (!authenticated) {
        return (
            <div className="col w-full p-6">
                <DetailedAlert
                    icon={<RiWalletLine />}
                    title="Connect Wallet"
                    description={
                        <div>
                            To proceed, please connect & sign in using your wallet so we can identify and display your profile.
                        </div>
                    }
                >
                    <ConnectKitButton />
                </DetailedAlert>
            </div>
        );
    }

    if (isFetchingAccount) {
        return (
            <div className="col items-center gap-6">
                <ProfileSection title={<Skeleton className="h-[32px] w-[200px] rounded-lg" />}>
                    <ProfileSectionWrapper>
                        <Skeleton className="h-[28px] w-28 rounded-lg" />
                        <Skeleton className="h-[120px] w-full rounded-xl" />

                        <Skeleton className="h-[28px] w-28 rounded-lg" />
                        <Skeleton className="h-[100px] w-full rounded-xl" />
                    </ProfileSectionWrapper>
                </ProfileSection>

                <ProfileSection title={<Skeleton className="h-[32px] w-[106px] rounded-lg" />}>
                    <ProfileSectionWrapper>
                        <Skeleton className="h-[28px] w-28 rounded-lg" />
                        <Skeleton className="h-[72px] w-full rounded-xl" />

                        <Skeleton className="h-[28px] w-28 rounded-lg" />
                        <Skeleton className="h-[72px] w-full rounded-xl" />
                    </ProfileSectionWrapper>
                </ProfileSection>
            </div>
        );
    }

    if (accountFetchError) {
        return (
            <div className="col w-full p-6">
                <DetailedAlert
                    variant="red"
                    icon={<RiCloseLargeLine />}
                    title="Error"
                    description={<div>The was an error fetching your profile information, please try again later.</div>}
                />
            </div>
        );
    }

    return (
        <div className="col items-center gap-6">
            {getRegistrationStatus() === RegistrationStatus.REGISTERED ? (
                <ProfileSection title="Personal Information">
                    <PersonalInformation />
                </ProfileSection>
            ) : (
                <ProfileSection title="Account">
                    <Registration registrationStatus={getRegistrationStatus()} />
                </ProfileSection>
            )}

            <ProfileSection title="Referrals">
                <Referrals />
            </ProfileSection>
        </div>
    );
}

export default Profile;
