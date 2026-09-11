import { VerificationExperience } from '@components/Verification/VerificationExperience';
import { Button } from '@heroui/button';
import { createVerificationSession, getAccount } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { routePath } from '@lib/routes/route-paths';
import { startVerificationStatusPolling, trackVerificationOutcome } from '@lib/verification-status-polling';
import { ApplicationStatus } from '@typedefs/profile';
import { SumsubVerificationSession, VerificationApplicantType, VerificationSession } from '@typedefs/verification';
import SumsubWebSdk from '@sumsub/websdk-react';
import { useSIWE } from 'connectkit';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RiArrowLeftLine, RiExternalLinkLine } from 'react-icons/ri';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';

const isApplicantType = (value: string | null): value is VerificationApplicantType =>
    value === 'individual' || value === 'company';

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
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { address, isConnected } = useAccount();
    const { isSignedIn, data: signedSession } = useSIWE();
    const identity = signedSession?.address?.toLowerCase();

    if (!isApplicantType(typeParam)) return <Navigate to={routePath.notFound} replace />;

    if (!authenticated || !isSignedIn || !isConnected || !identity || address?.toLowerCase() !== identity) {
        return <VerificationExperience applicantType={typeParam} stage="loading" />;
    }

    return <IdentityVerification key={`${identity}:${typeParam}`} identity={identity} applicantType={typeParam} />;
}

const isConfirmedResult = (status: ApplicationStatus) =>
    status === ApplicationStatus.Approved || status === ApplicationStatus.FinalRejected || status === ApplicationStatus.OnHold;

function IdentityVerification({ identity, applicantType }: { identity: string; applicantType: VerificationApplicantType }) {
    const { setAccount } = useAuthenticationContext() as AuthenticationContextType;

    const [session, setSession] = useState<VerificationSession>();
    const [isConsentAccepted, setConsentAccepted] = useState(false);
    const [isLoadingSession, setLoadingSession] = useState(true);
    const [isLaunched, setLaunched] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [confirmedStatus, setConfirmedStatus] = useState<ApplicationStatus>();
    const sessionRequestInFlight = useRef(false);
    const lifecycle = useRef(0);
    const isMounted = useRef(false);

    useLayoutEffect(() => {
        isMounted.current = true;
        lifecycle.current += 1;
        return () => {
            isMounted.current = false;
            lifecycle.current += 1;
        };
    }, []);

    const refreshAccount = useCallback(
        async (generation: number) => {
            const latestAccount = await getAccount();
            if (generation !== lifecycle.current) return;
            if (latestAccount.address.toLowerCase() !== identity) {
                throw new Error('Authenticated account does not match this verification flow.');
            }
            setAccount(latestAccount);
            return latestAccount;
        },
        [identity, setAccount],
    );

    const refreshEntryStatus = useCallback(async () => {
        const generation = lifecycle.current;
        setLoadingSession(true);
        setErrorMessage(undefined);
        try {
            const latestAccount = await refreshAccount(generation);
            if (!latestAccount) return;
            if (isConfirmedResult(latestAccount.kycStatus)) setConfirmedStatus(latestAccount.kycStatus);
        } catch (error) {
            if (generation !== lifecycle.current) return;
            console.error('Unable to refresh verification status:', error);
            setErrorMessage('We could not securely confirm your verification status. Please try again.');
        } finally {
            if (generation === lifecycle.current) setLoadingSession(false);
        }
    }, [refreshAccount]);

    useEffect(() => {
        void refreshEntryStatus();
    }, [refreshEntryStatus]);

    const loadSession = useCallback(
        async (type: VerificationApplicantType) => {
            if (sessionRequestInFlight.current) return;
            const generation = lifecycle.current;
            sessionRequestInFlight.current = true;
            setSession(undefined);
            setErrorMessage(undefined);
            setConfirmedStatus(undefined);
            setLoadingSession(true);
            setLaunched(false);

            try {
                const latestAccount = await refreshAccount(generation);
                if (!latestAccount) return;
                if (isConfirmedResult(latestAccount.kycStatus)) {
                    setConfirmedStatus(latestAccount.kycStatus);
                    return;
                }
                const response = await createVerificationSession(type);
                if (generation !== lifecycle.current) return;

                if (response.applicantType !== type) {
                    throw new Error('Verification applicant type does not match the requested flow.');
                }

                setSession(response);
                setLaunched(true);
            } catch (error) {
                if (generation !== lifecycle.current) return;
                console.error('Unable to prepare verification session:', error);
                try {
                    const latestAccount = await refreshAccount(generation);
                    if (!latestAccount) return;
                    if (isConfirmedResult(latestAccount.kycStatus)) {
                        setConfirmedStatus(latestAccount.kycStatus);
                        return;
                    }
                } catch (refreshError) {
                    console.error('Unable to refresh verification status:', refreshError);
                }
                if (generation !== lifecycle.current) return;
                setErrorMessage('We could not securely prepare your verification session. Please try again.');
            } finally {
                if (generation === lifecycle.current) {
                    sessionRequestInFlight.current = false;
                    setLoadingSession(false);
                }
            }
        },
        [refreshAccount],
    );

    useEffect(() => {
        if (!isLaunched || !session || confirmedStatus) {
            return;
        }

        let isDisposed = false;
        const generation = lifecycle.current;
        const isNewOutcome = trackVerificationOutcome(session.status);

        const refreshStatus = async () => {
            try {
                const latestAccount = await refreshAccount(generation);
                if (isDisposed || !latestAccount) return false;

                if (isNewOutcome(latestAccount.kycStatus)) {
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
    }, [isLaunched, session, refreshAccount, confirmedStatus]);

    const retry = () => (isConsentAccepted ? loadSession(applicantType) : refreshEntryStatus());

    const launch = async () => {
        if (!isConsentAccepted || isLoadingSession) return;
        await loadSession(applicantType);
    };

    const refreshSumsubAccessToken = async (currentSession: SumsubVerificationSession) => {
        if (!isMounted.current) throw new Error('Verification identity changed.');
        const generation = lifecycle.current;
        const refreshedSession = await createVerificationSession(currentSession.applicantType);

        if (generation !== lifecycle.current) throw new Error('Verification identity changed.');

        if (refreshedSession.provider !== 'sumsub' || refreshedSession.applicantType !== applicantType) {
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
                applicantType={applicantType}
                provider={session?.provider}
                stage={stage}
                providerContent={renderProvider()}
                isConsentAccepted={isConsentAccepted}
                isLaunching={isLoadingSession}
                errorMessage={errorMessage}
                statusMessage={confirmedStatus ? getStatusMessage(confirmedStatus, applicantType) : undefined}
                onConsentChange={setConsentAccepted}
                onLaunch={launch}
                onRetry={retry}
            />
        </div>
    );
}

export default KYC;
