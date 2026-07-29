import { describe, expect, it } from 'vitest';
import { parseVerificationSession } from './verification';

const commonSession = {
    applicantType: 'individual',
    status: 'init',
};

describe('parseVerificationSession', () => {
    it('accepts a Didit session with only the hosted URL credential', () => {
        expect(
            parseVerificationSession({
                ...commonSession,
                provider: 'didit',
                sessionId: '11111111-2222-3333-4444-555555555555',
                url: 'https://verify.didit.me/session/secret',
            }),
        ).toEqual({
            ...commonSession,
            provider: 'didit',
            sessionId: '11111111-2222-3333-4444-555555555555',
            url: 'https://verify.didit.me/session/secret',
        });
    });

    it('accepts a Sumsub rollback session with only an access token', () => {
        expect(
            parseVerificationSession({
                ...commonSession,
                provider: 'sumsub',
                accessToken: 'short-lived-access-token',
            }),
        ).toEqual({
            ...commonSession,
            provider: 'sumsub',
            accessToken: 'short-lived-access-token',
        });
    });

    it('rejects mixed provider credentials', () => {
        expect(() =>
            parseVerificationSession({
                ...commonSession,
                provider: 'didit',
                sessionId: '11111111-2222-3333-4444-555555555555',
                url: 'https://verify.didit.me/session/secret',
                accessToken: 'unexpected-token',
            }),
        ).toThrow('exactly one provider credential');

        expect(() =>
            parseVerificationSession({
                ...commonSession,
                provider: 'didit',
                sessionId: '11111111-2222-3333-4444-555555555555',
                url: 'https://verify.didit.me/session/secret',
                accessToken: '',
            }),
        ).toThrow('exactly one provider credential');
    });

    it('rejects Didit responses without a session id', () => {
        expect(() =>
            parseVerificationSession({
                ...commonSession,
                provider: 'didit',
                url: 'https://verify.didit.me/session/secret',
            }),
        ).toThrow('Invalid Didit');
    });

    it('rejects non-HTTPS Didit hosted URLs', () => {
        expect(() =>
            parseVerificationSession({
                ...commonSession,
                provider: 'didit',
                sessionId: '11111111-2222-3333-4444-555555555555',
                url: 'http://verify.didit.me/session/secret',
            }),
        ).toThrow('must use HTTPS');
    });

    it('rejects unknown providers and applicant types', () => {
        expect(() =>
            parseVerificationSession({
                ...commonSession,
                provider: 'unknown',
                accessToken: 'token',
            }),
        ).toThrow('Invalid verification session response');

        expect(() =>
            parseVerificationSession({
                ...commonSession,
                applicantType: 'organization',
                provider: 'sumsub',
                accessToken: 'token',
            }),
        ).toThrow('Invalid verification session response');
    });
});
