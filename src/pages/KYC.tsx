import { VerificationExperience } from '@components/Verification/VerificationExperience';
import { Button } from '@heroui/button';
import { createVerificationSession, getAccount } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { routePath } from '@lib/routes/route-paths';
import { startVerificationStatusPolling } from '@lib/verification-status-polling';
import { ApplicationStatus } from '@typedefs/profile';
import { SumsubVerificationSession, VerificationApplicantType, VerificationSession } from '@typedefs/verification';
import SumsubWebSdk from '@sumsub/websdk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RiArrowLeftLine, RiExternalLinkLine } from 'react-icons/ri';
import { Link, Navigate, useSearchParams } from 'react-router-dom';

const isApplicantType = (value: string | null): value is VerificationApplicantType =>
    value === 'individual' || value === 'company';

const isStatusOutcome = (status: ApplicationStatus) =>
    status === ApplicationStatus.Approved ||
    status === ApplicationStatus.OnHold ||
    status === ApplicationStatus.Rejected ||
    status === ApplicationStatus.FinalRejected;

const getStatusMessage = (status: ApplicationStatus, applicantType: VerificationApplicantType) => {
    const verificationType = applicantType === 'company' ? 'KYB' : 'KYC';

    switch (status) {
        case ApplicationStatus.Approved:
            return `Your ${verificationType} has been approved.`;
        case ApplicationStatus.OnHold:
            return `Your ${verificationType} was submitted and is under review.`;
        case ApplicationStatus.Rejected:
            return `Your ${verificationType} needs additional information. You can continue it from your profile.`;
        case ApplicationStatus.FinalRejected:
            return `Your ${verificationType} could not be approved. Review the status from your profile.`;
        default:
            return `Your latest ${verificationType} status is available from your profile.`;
    }
};

function KYC() {
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const { account, setAccount } = useAuthenticationContext() as AuthenticationContextType;

    const [session, setSession] = useState<VerificationSession>();
    const [isConsentAccepted, setConsentAccepted] = useState(false);
    const [isLoadingSession, setLoadingSession] = useState(false);
    const [isLaunched, setLaunched] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [confirmedStatus, setConfirmedStatus] = useState<ApplicationStatus>();
    const statusAtLaunch = useRef<ApplicationStatus>();
    const sessionRequestInFlight = useRef(false);

    const loadSession = useCallback(async (type: VerificationApplicantType) => {
        if (sessionRequestInFlight.current) return;
        sessionRequestInFlight.current = true;
        setSession(undefined);
        setErrorMessage(undefined);
        setConfirmedStatus(undefined);
        setLoadingSession(true);
        setLaunched(false);

        try {
            const response = await createVerificationSession(type);

            if (response.applicantType !== type) {
                throw new Error('Verification applicant type does not match the requested flow.');
            }

            setSession(response);
            setLaunched(true);
        } catch (error) {
            console.error('Unable to prepare verification session:', error);
            setErrorMessage('We could not securely prepare your verification session. Please try again.');
        } finally {
            sessionRequestInFlight.current = false;
            setLoadingSession(false);
        }
    }, []);

    useEffect(() => {
        if (!isLaunched || !isApplicantType(typeParam)) {
            return;
        }

        let isDisposed = false;

        const refreshStatus = async () => {
            try {
                const latestAccount = await getAccount();
                if (isDisposed) return false;

                setAccount(latestAccount);

                if (isStatusOutcome(latestAccount.kycStatus) && latestAccount.kycStatus !== statusAtLaunch.current) {
                    setConfirmedStatus(latestAccount.kycStatus);
                    return true;
                }
            } catch (error) {
                console.error('Unable to refresh verification status:', error);
            }

            return false;
        };

        const stopPolling = startVerificationStatusPolling(refreshStatus);

        return () => {
            isDisposed = true;
            stopPolling();
        };
    }, [isLaunched, setAccount, typeParam]);

    if (!isApplicantType(typeParam)) {
        return <Navigate to={routePath.notFound} replace />;
    }

    const retry = () => loadSession(typeParam);

    const launch = async () => {
        if (!isConsentAccepted) return;
        statusAtLaunch.current = account?.kycStatus;
        await loadSession(typeParam);
    };

    const refreshSumsubAccessToken = async (currentSession: SumsubVerificationSession) => {
        const refreshedSession = await createVerificationSession(currentSession.applicantType);

        if (refreshedSession.provider !== 'sumsub') {
            throw new Error('Verification provider changed. Reload the page to continue.');
        }

        setSession(refreshedSession);
        return refreshedSession.accessToken;
    };

    const renderProvider = () => {
        if (!session) return null;

        if (session.provider === 'didit') {
            return (
                <div className="col">
                    <iframe
                        key={session.sessionId}
                        src={session.url}
                        title={`${session.applicantType === 'company' ? 'KYB' : 'KYC'} verification powered by Didit`}
                        allow="camera; microphone; fullscreen; autoplay; encrypted-media"
                        referrerPolicy="no-referrer"
                        className="h-[720px] min-h-[70dvh] w-full border-0 bg-white"
                    />
                    <div className="border-t border-slate-100 px-4 py-3 text-center text-sm text-slate-500">
                        Camera not opening?{' '}
                        <a
                            className="text-primary inline-flex items-center gap-1 font-medium underline"
                            href={session.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open the secure verification in a new tab
                            <RiExternalLinkLine />
                        </a>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6">
                <SumsubWebSdk
                    className="w-full"
                    accessToken={session.accessToken}
                    expirationHandler={() => refreshSumsubAccessToken(session)}
                    options={{ addViewportTag: false, adaptIframeHeight: true }}
                    onError={() =>
                        setErrorMessage('The embedded verification could not load. Please retry the secure session.')
                    }
                />
            </div>
        );
    };

    const stage = confirmedStatus
        ? 'status'
        : errorMessage
          ? 'error'
          : isLoadingSession
            ? 'loading'
            : session && isLaunched
              ? 'provider'
              : 'consent';

    return (
        <div className="center-all w-full flex-col gap-6">
            <Button color="primary" variant="solid" as={Link} to={routePath.profile}>
                <div className="row gap-1.5">
                    <RiArrowLeftLine className="text-[18px]" />
                    <div className="text-sm font-medium lg:text-base">Profile</div>
                </div>
            </Button>

            <VerificationExperience
                applicantType={typeParam}
                provider={session?.provider}
                stage={stage}
                providerContent={renderProvider()}
                isConsentAccepted={isConsentAccepted}
                isLaunching={isLoadingSession}
                errorMessage={errorMessage}
                statusMessage={confirmedStatus ? getStatusMessage(confirmedStatus, typeParam) : undefined}
                onConsentChange={setConsentAccepted}
                onLaunch={launch}
                onRetry={retry}
            />
        </div>
    );
}

export default KYC;
