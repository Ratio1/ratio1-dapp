export type VerificationApplicantType = 'individual' | 'company';
export type VerificationProvider = 'didit' | 'sumsub';

type VerificationSessionBase = {
    applicantType: VerificationApplicantType;
    status: string;
};

export type DiditVerificationSession = VerificationSessionBase & {
    provider: 'didit';
    sessionId: string;
    url: string;
    accessToken?: never;
};

export type SumsubVerificationSession = VerificationSessionBase & {
    provider: 'sumsub';
    accessToken: string;
    sessionId?: string;
    url?: never;
};

export type VerificationSession = DiditVerificationSession | SumsubVerificationSession;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const nonEmptyString = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim().length > 0 ? value : undefined;

export const parseVerificationSession = (value: unknown): VerificationSession => {
    if (!isRecord(value)) {
        throw new Error('Invalid verification session response.');
    }

    const provider = value.provider;
    const applicantType = value.applicantType;
    const status = nonEmptyString(value.status);
    const sessionId = nonEmptyString(value.sessionId);
    const url = nonEmptyString(value.url);
    const accessToken = nonEmptyString(value.accessToken);
    const hasUrlCredential = Object.prototype.hasOwnProperty.call(value, 'url');
    const hasAccessTokenCredential = Object.prototype.hasOwnProperty.call(value, 'accessToken');

    if (
        (provider !== 'didit' && provider !== 'sumsub') ||
        (applicantType !== 'individual' && applicantType !== 'company') ||
        !status
    ) {
        throw new Error('Invalid verification session response.');
    }

    if (Number(hasUrlCredential) + Number(hasAccessTokenCredential) !== 1) {
        throw new Error('Verification response must contain exactly one provider credential.');
    }

    if (provider === 'didit') {
        if (!sessionId || !url || accessToken) {
            throw new Error('Invalid Didit verification session response.');
        }

        let hostedUrl: URL;
        try {
            hostedUrl = new URL(url);
        } catch {
            throw new Error('Invalid Didit verification URL.');
        }

        if (hostedUrl.protocol !== 'https:') {
            throw new Error('Didit verification URL must use HTTPS.');
        }

        return {
            provider,
            applicantType,
            status,
            sessionId,
            url: hostedUrl.toString(),
        };
    }

    if (!accessToken || url) {
        throw new Error('Invalid Sumsub verification session response.');
    }

    return {
        provider,
        applicantType,
        status,
        accessToken,
        ...(sessionId ? { sessionId } : {}),
    };
};
