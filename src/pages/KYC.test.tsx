// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import KYC from './KYC';

const mocks = vi.hoisted(() => ({
    address: '0xaaa',
    signedAddress: '0xaaa',
    authenticated: true,
    getAccount: vi.fn(),
    createSession: vi.fn(),
    setAccount: vi.fn(),
    sumsubExpiration: undefined as undefined | (() => Promise<string>),
}));
vi.mock('@lib/api/backend', () => ({ getAccount: mocks.getAccount, createVerificationSession: mocks.createSession }));
vi.mock('@lib/contexts/authentication', () => ({
    useAuthenticationContext: () => ({ authenticated: mocks.authenticated, setAccount: mocks.setAccount }),
}));
vi.mock('wagmi', () => ({ useAccount: () => ({ address: mocks.address, isConnected: mocks.authenticated }) }));
vi.mock('connectkit', () => ({
    useSIWE: () => ({ isSignedIn: mocks.authenticated, data: { address: mocks.signedAddress } }),
}));
vi.mock('@sumsub/websdk-react', () => ({
    default: ({ expirationHandler }) => {
        mocks.sumsubExpiration = expirationHandler;
        return <div>Sumsub</div>;
    },
}));
vi.mock('@heroui/button', () => ({ Button: ({ children }) => <button>{children}</button> }));
vi.mock('@components/Verification/VerificationExperience', () => ({
    VerificationExperience: (props) => (
        <div>
            <div data-testid="stage">{props.stage}</div>
            <div>{props.statusMessage}</div>
            {props.stage === 'provider' && props.providerContent}
            {props.stage === 'consent' && (
                <>
                    <button onClick={() => props.onConsentChange(true)}>Accept consent</button>
                    <button onClick={props.onLaunch}>Launch</button>
                </>
            )}
            {props.stage === 'error' && <button onClick={props.onRetry}>Retry</button>}
        </div>
    ),
}));

const account = (address = mocks.address, kycStatus = 'init') => ({ address, kycStatus });
const session = (id = 'A') => ({
    provider: 'didit',
    applicantType: 'individual',
    status: 'init',
    sessionId: id,
    url: `https://verify.didit.me/session/${id}`,
});
const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
};
const view = () => (
    <MemoryRouter initialEntries={['/kyc?type=individual']}>
        <KYC />
    </MemoryRouter>
);
const launch = async () => {
    await screen.findByText('Accept consent');
    fireEvent.click(screen.getByText('Accept consent'));
    fireEvent.click(screen.getByText('Launch'));
};

beforeEach(() => {
    vi.clearAllMocks();
    mocks.address = '0xaaa';
    mocks.signedAddress = '0xaaa';
    mocks.authenticated = true;
    mocks.getAccount.mockImplementation(async () => account());
    mocks.createSession.mockResolvedValue(session());
});
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('verification account lifecycle', () => {
    it('hides the session while the wallet and signed identity disagree', async () => {
        const rendered = render(view());
        await launch();
        await screen.findByTitle('KYC verification powered by Didit');
        mocks.address = '0xbbb';
        rendered.rerender(view());
        expect(screen.queryByTitle('KYC verification powered by Didit')).toBeNull();
        expect(screen.getByTestId('stage').textContent).toBe('loading');
    });

    it('ignores the first entry request discarded by StrictMode replay', async () => {
        const pending = deferred<ReturnType<typeof account>>();
        mocks.getAccount.mockReturnValueOnce(pending.promise);
        render(<StrictMode>{view()}</StrictMode>);
        await screen.findByText('Accept consent');
        mocks.setAccount.mockClear();
        await act(async () => pending.resolve(account('0xaaa', 'approved')));
        expect(mocks.setAccount).not.toHaveBeenCalled();
        expect(screen.getByTestId('stage').textContent).toBe('consent');
    });

    it('entry refresh retry cannot bypass consent', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.getAccount.mockRejectedValueOnce(new Error('offline'));
        render(view());
        fireEvent.click(await screen.findByText('Retry'));
        await screen.findByText('Accept consent');
        expect(mocks.createSession).not.toHaveBeenCalled();
        fireEvent.click(screen.getByText('Launch'));
        expect(mocks.createSession).not.toHaveBeenCalled();
    });

    it('rejects stale Sumsub renewal and callbacks invoked after identity change', async () => {
        const sumsub = { provider: 'sumsub', applicantType: 'individual', status: 'init', accessToken: 'test-only' };
        mocks.createSession.mockResolvedValueOnce(sumsub);
        const rendered = render(view());
        await launch();
        await screen.findByText('Sumsub');
        const oldExpiration = mocks.sumsubExpiration!;
        const pending = deferred<typeof sumsub>();
        mocks.createSession.mockReturnValueOnce(pending.promise);
        const result = oldExpiration();
        const rejected = expect(result).rejects.toThrow('identity changed');
        mocks.address = '0xbbb';
        mocks.signedAddress = '0xbbb';
        rendered.rerender(view());
        await screen.findByText('Accept consent');
        await act(async () => pending.resolve(sumsub));
        await rejected;
        await expect(oldExpiration()).rejects.toThrow('identity changed');
        expect(mocks.createSession).toHaveBeenCalledTimes(2);
        expect(screen.queryByText('Sumsub')).toBeNull();
    });

    it('removes A iframe immediately on account switch and requires new consent', async () => {
        const rendered = render(view());
        await launch();
        await screen.findByTitle('KYC verification powered by Didit');
        mocks.address = '0xbbb';
        mocks.signedAddress = '0xbbb';
        rendered.rerender(view());
        expect(screen.queryByTitle('KYC verification powered by Didit')).toBeNull();
        await screen.findByText('Accept consent');
        fireEvent.click(screen.getByText('Launch'));
        expect(mocks.createSession).toHaveBeenCalledTimes(1);
    });

    it('discards an old session creation response after switching accounts', async () => {
        const pending = deferred<ReturnType<typeof session>>();
        mocks.createSession.mockReturnValueOnce(pending.promise);
        const rendered = render(view());
        await launch();
        await waitFor(() => expect(mocks.createSession).toHaveBeenCalledTimes(1));
        mocks.address = '0xbbb';
        mocks.signedAddress = '0xbbb';
        rendered.rerender(view());
        await screen.findByText('Accept consent');
        await act(async () => pending.resolve(session('A')));
        expect(screen.queryByTitle('KYC verification powered by Didit')).toBeNull();
        expect(screen.getByTestId('stage').textContent).toBe('consent');
    });

    it('discards an in-flight A poll after B signs in', async () => {
        const rendered = render(view());
        await launch();
        await screen.findByTitle('KYC verification powered by Didit');
        const pending = deferred<ReturnType<typeof account>>();
        mocks.getAccount.mockReturnValueOnce(pending.promise);
        fireEvent(window, new Event('focus'));
        mocks.address = '0xbbb';
        mocks.signedAddress = '0xbbb';
        rendered.rerender(view());
        await screen.findByText('Accept consent');
        mocks.setAccount.mockClear();
        await act(async () => pending.resolve(account('0xaaa', 'approved')));
        expect(mocks.setAccount).not.toHaveBeenCalled();
        expect(screen.queryByText('Your KYC has been approved.')).toBeNull();
    });

    it('rejects a different account returned by a current poll', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        render(view());
        await launch();
        await screen.findByTitle('KYC verification powered by Didit');
        mocks.setAccount.mockClear();
        mocks.getAccount.mockResolvedValueOnce(account('0xbbb', 'approved'));
        await act(async () => fireEvent(window, new Event('focus')));
        expect(mocks.setAccount).not.toHaveBeenCalled();
        expect(screen.queryByText('Your KYC has been approved.')).toBeNull();
    });

    it.each(['approved', 'finalRejected', 'onHold'])('shows %s on entry without creating a session', async (status) => {
        mocks.getAccount.mockResolvedValue(account('0xaaa', status));
        render(view());
        await waitFor(() => expect(screen.getByTestId('stage').textContent).toBe('status'));
        expect(mocks.createSession).not.toHaveBeenCalled();
    });

    it('refreshes status after creation fails and displays approval instead of retry error', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.createSession.mockImplementation(async () => {
            mocks.getAccount.mockResolvedValue(account('0xaaa', 'approved'));
            throw new Error('already complete');
        });
        render(view());
        await launch();
        await screen.findByText('Your KYC has been approved.');
        expect(screen.getByTestId('stage').textContent).toBe('status');
    });

    it('still allows a retryable rejection to start a new session', async () => {
        mocks.getAccount.mockResolvedValue(account('0xaaa', 'rejected'));
        render(view());
        await launch();
        await screen.findByTitle('KYC verification powered by Didit');
        expect(mocks.createSession).toHaveBeenCalledTimes(1);
    });

    it('clears the provider when authentication is lost', async () => {
        const rendered = render(view());
        await launch();
        await screen.findByTitle('KYC verification powered by Didit');
        mocks.authenticated = false;
        rendered.rerender(view());
        expect(screen.queryByTitle('KYC verification powered by Didit')).toBeNull();
    });
});
