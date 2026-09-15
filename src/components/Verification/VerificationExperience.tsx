import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { routePath } from '@lib/routes/route-paths';
import { DetailedAlert } from '@shared/DetailedAlert';
import { VerificationApplicantType, VerificationProvider } from '@typedefs/verification';
import { RiArrowRightLine, RiCheckboxCircleLine, RiErrorWarningLine, RiShieldUserLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export type VerificationExperienceStage = 'loading' | 'consent' | 'provider' | 'error' | 'status';

type Props = {
    applicantType: VerificationApplicantType;
    provider?: VerificationProvider;
    stage: VerificationExperienceStage;
    providerContent?: React.ReactNode;
    isConsentAccepted?: boolean;
    isLaunching?: boolean;
    errorMessage?: string;
    statusMessage?: string;
    onConsentChange?: (accepted: boolean) => void;
    onLaunch?: () => void;
    onRetry?: () => void;
};

const localPrivacyPolicyPath = `${routePath.compliance}/${routePath.privacyPolicy}`;
const localTermsPath = `${routePath.compliance}/${routePath.termsAndConditions}`;

const applicationLabel = (applicantType: VerificationApplicantType) => (applicantType === 'company' ? 'KYB' : 'KYC');

const providerLabel = (provider?: VerificationProvider) => {
    if (provider === 'didit') return 'Didit';
    if (provider === 'sumsub') return 'Sumsub';
    return 'A secure third-party verification provider';
};

export function VerificationExperience({
    applicantType,
    provider,
    stage,
    providerContent,
    isConsentAccepted = false,
    isLaunching = false,
    errorMessage,
    statusMessage,
    onConsentChange,
    onLaunch,
    onRetry,
}: Props) {
    const verificationType = applicationLabel(applicantType);
    const selectedProvider = providerLabel(provider);

    if (stage === 'loading') {
        return (
            <VerificationCard>
                <div className="center-all min-h-[360px] flex-col gap-4 text-center">
                    <Spinner size="lg" />
                    <div className="col gap-1">
                        <div className="text-lg font-semibold">Preparing your {verificationType}</div>
                        <div className="text-sm text-slate-500">Securely creating or resuming your verification session.</div>
                    </div>
                </div>
            </VerificationCard>
        );
    }

    if (stage === 'error') {
        return (
            <VerificationCard>
                <DetailedAlert
                    variant="red"
                    icon={<RiErrorWarningLine />}
                    title="Verification unavailable"
                    description={
                        <div>
                            {errorMessage ||
                                `We couldn't prepare your ${verificationType}. No information was submitted. Please try again.`}
                        </div>
                    }
                >
                    {!!onRetry && (
                        <Button color="primary" onPress={onRetry}>
                            Try again
                        </Button>
                    )}
                </DetailedAlert>
            </VerificationCard>
        );
    }

    if (stage === 'status') {
        return (
            <VerificationCard>
                <DetailedAlert
                    icon={<RiCheckboxCircleLine />}
                    title={`${verificationType} status updated`}
                    description={
                        <div>
                            {statusMessage ||
                                'Your latest verification status was confirmed by Ratio1. Review it from your profile.'}
                        </div>
                    }
                >
                    <Button color="primary" as={Link} to={routePath.profile}>
                        Return to profile
                    </Button>
                </DetailedAlert>
            </VerificationCard>
        );
    }

    if (stage === 'provider') {
        return (
            <VerificationCard noPadding>
                <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
                    <div className="row flex-wrap justify-between gap-2">
                        <div>
                            <div className="font-semibold">{verificationType} verification</div>
                            <div className="text-sm text-slate-500">Securely powered by {selectedProvider}</div>
                        </div>
                        <Button variant="bordered" size="sm" as={Link} to={routePath.profile}>
                            Check status
                        </Button>
                    </div>
                </div>
                {providerContent}
            </VerificationCard>
        );
    }

    return (
        <VerificationCard>
            <div className="col gap-6">
                <div className="col gap-3">
                    <div className="center-all bg-primary-100 text-primary-500 h-12 w-12 rounded-full text-2xl">
                        <RiShieldUserLine />
                    </div>
                    <div className="col gap-1">
                        <div className="text-xl font-semibold">Before you begin your {verificationType}</div>
                        <div className="text-sm leading-6 text-slate-600">
                            Ratio1 is requesting this verification. {selectedProvider} provides the identity and
                            business-verification technology used in the process.
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
                    The process may collect identity or company documents, address and tax information, selfies, liveness video,
                    and biometric data. It may also include AML, sanctions, and politically exposed person screening.
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                        className="accent-primary mt-1 h-4 w-4 shrink-0"
                        type="checkbox"
                        checked={isConsentAccepted}
                        onChange={(event) => onConsentChange?.(event.target.checked)}
                    />
                    <span className="text-sm leading-6 text-slate-700">
                        I have read Ratio1&apos;s{' '}
                        <Link
                            className="text-primary font-medium underline"
                            to={localPrivacyPolicyPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                        >
                            Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link
                            className="text-primary font-medium underline"
                            to={localTermsPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                        >
                            Terms &amp; Conditions
                        </Link>
                        , and I affirmatively consent to the processing described above for this {verificationType}.
                    </span>
                </label>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <Button variant="bordered" as={Link} to={routePath.profile}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        isDisabled={!isConsentAccepted || isLaunching}
                        isLoading={isLaunching}
                        onPress={onLaunch}
                    >
                        <div className="row gap-1.5">
                            Continue securely
                            <RiArrowRightLine />
                        </div>
                    </Button>
                </div>
            </div>
        </VerificationCard>
    );
}

function VerificationCard({ children, noPadding = false }: { children: React.ReactNode; noPadding?: boolean }) {
    return (
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-slate-100 bg-white">
            <div className={noPadding ? '' : 'p-5 sm:p-7'}>{children}</div>
        </div>
    );
}
