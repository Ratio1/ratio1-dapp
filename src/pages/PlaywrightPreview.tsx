import { VerificationExperience, VerificationExperienceStage } from '@components/Verification/VerificationExperience';
import { routePath } from '@lib/routes/route-paths';
import { VerificationProvider } from '@typedefs/verification';
import { RiBuilding2Line, RiIdCardLine } from 'react-icons/ri';
import { Navigate } from 'react-router-dom';

/*
Use this route to render real UI components for Playwright screenshots without requiring
login/wallet flows. Keep data deterministic and avoid live API/blockchain dependencies.
*/
export default function PlaywrightPreview() {
    if (!import.meta.env.DEV) {
        return <Navigate to={routePath.notFound} replace />;
    }

    return (
        <main className="mx-auto min-h-dvh w-full max-w-6xl bg-[#fcfcfd] p-4 sm:p-6 md:p-10">
            <section id="playwright-preview" className="col gap-10">
                <div className="col gap-2 text-center">
                    <h1 className="text-3xl font-bold">Verification migration preview</h1>
                    <p className="text-slate-500">Deterministic KYC/KYB states with no wallet, API, or provider dependency.</p>
                </div>

                <PreviewState title="Consent gate" stage="consent" />
                <PreviewState title="Session loading" stage="loading" />
                <PreviewState title="Didit embedded flow" stage="provider" provider="didit" />
                <PreviewState title="Sumsub rollback flow" stage="provider" provider="sumsub" applicantType="company" />
                <PreviewState title="Session error" stage="error" />
                <PreviewState title="Backend-confirmed status" stage="status" applicantType="company" />
            </section>
        </main>
    );
}

function PreviewState({
    title,
    stage,
    provider,
    applicantType = 'individual',
}: {
    title: string;
    stage: VerificationExperienceStage;
    provider?: VerificationProvider;
    applicantType?: 'individual' | 'company';
}) {
    return (
        <div className="col items-center gap-3">
            <div className="text-sm font-semibold tracking-wider text-slate-400 uppercase">{title}</div>
            <VerificationExperience
                applicantType={applicantType}
                provider={provider}
                stage={stage}
                providerContent={
                    stage === 'provider' && provider ? (
                        <ProviderPlaceholder provider={provider} applicantType={applicantType} />
                    ) : undefined
                }
                errorMessage="The secure session could not be prepared. No information was submitted."
                statusMessage="Your KYB was submitted and is under review."
            />
        </div>
    );
}

function ProviderPlaceholder({
    provider,
    applicantType,
}: {
    provider: VerificationProvider;
    applicantType: 'individual' | 'company';
}) {
    const Icon = applicantType === 'company' ? RiBuilding2Line : RiIdCardLine;

    return (
        <div className="center-all min-h-[420px] flex-col gap-4 bg-slate-50 p-6 text-center">
            <div className="center-all text-primary h-16 w-16 rounded-2xl bg-white text-3xl shadow-sm">
                <Icon />
            </div>
            <div className="col gap-1">
                <div className="text-xl font-semibold">{provider === 'didit' ? 'Didit' : 'Sumsub'} hosted verification</div>
                <div className="text-sm text-slate-500">
                    {applicantType === 'company' ? 'Business verification' : 'Identity verification'} is embedded here.
                </div>
            </div>
        </div>
    );
}
