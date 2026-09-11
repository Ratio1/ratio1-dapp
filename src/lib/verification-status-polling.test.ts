import { describe, expect, it, vi } from 'vitest';
import { ApplicationStatus } from '@typedefs/profile';
import {
    startVerificationStatusPolling,
    trackVerificationOutcome,
    verificationStatusRefreshIntervalMs,
    VerificationPollingRuntime,
} from './verification-status-polling';

const createRuntime = () => {
    let intervalHandler: (() => void) | undefined;
    let focusHandler: (() => void) | undefined;

    const runtime: VerificationPollingRuntime = {
        setInterval: vi.fn((handler, timeout) => {
            intervalHandler = handler;
            expect(timeout).toBe(verificationStatusRefreshIntervalMs);
            return 42;
        }),
        clearInterval: vi.fn(),
        addEventListener: vi.fn((_type, listener) => {
            focusHandler = listener;
        }),
        removeEventListener: vi.fn(),
    };

    return {
        runtime,
        runInterval: () => intervalHandler?.(),
        focus: () => focusHandler?.(),
        getFocusHandler: () => focusHandler,
    };
};

const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

describe('trackVerificationOutcome', () => {
    it('recognizes a repeated rejection after an intermediate state', () => {
        const observe = trackVerificationOutcome(ApplicationStatus.Rejected);
        expect(observe(ApplicationStatus.Rejected)).toBe(false);
        expect(observe(ApplicationStatus.Init)).toBe(false);
        expect(observe(ApplicationStatus.Rejected)).toBe(true);
    });

    it('uses the new session status even if rejection occurs before the first poll', () => {
        const observe = trackVerificationOutcome(ApplicationStatus.Init);
        expect(observe(ApplicationStatus.Rejected)).toBe(true);
    });

    it.each([
        ApplicationStatus.Approved,
        ApplicationStatus.OnHold,
        ApplicationStatus.Rejected,
        ApplicationStatus.FinalRejected,
    ])('recognizes %s after pending but does not repeat an unchanged outcome', (outcome) => {
        const observe = trackVerificationOutcome(ApplicationStatus.Init);
        expect(observe(ApplicationStatus.Pending)).toBe(false);
        expect(observe(outcome)).toBe(true);
        expect(observe(outcome)).toBe(false);
    });
});

describe('startVerificationStatusPolling', () => {
    it('stops the timer and focus polling after init then repeated rejection', async () => {
        const { runtime, runInterval, focus } = createRuntime();
        const observe = trackVerificationOutcome(ApplicationStatus.Rejected);
        const statuses = [ApplicationStatus.Init, ApplicationStatus.Rejected];
        const refreshStatus = vi.fn(async () => observe(statuses.shift()!));
        startVerificationStatusPolling(refreshStatus, runtime);
        runInterval();
        await flushPromises();
        expect(runtime.clearInterval).not.toHaveBeenCalled();
        runInterval();
        await flushPromises();
        expect(runtime.clearInterval).toHaveBeenCalledOnce();
        expect(runtime.removeEventListener).toHaveBeenCalledOnce();
        focus();
        await flushPromises();
        expect(refreshStatus).toHaveBeenCalledTimes(2);
    });
    it('refreshes on the timer and focus, then removes both lifecycle hooks on cleanup', async () => {
        const { runtime, runInterval, focus, getFocusHandler } = createRuntime();
        const refreshStatus = vi.fn().mockResolvedValue(false);
        const stop = startVerificationStatusPolling(refreshStatus, runtime);
        const registeredFocusHandler = getFocusHandler();

        runInterval();
        await flushPromises();
        focus();
        await flushPromises();

        expect(refreshStatus).toHaveBeenCalledTimes(2);

        stop();

        expect(runtime.clearInterval).toHaveBeenCalledOnce();
        expect(runtime.clearInterval).toHaveBeenCalledWith(42);
        expect(runtime.removeEventListener).toHaveBeenCalledWith('focus', registeredFocusHandler);
    });

    it('stops polling as soon as the backend confirms a terminal status', async () => {
        const { runtime, runInterval, focus } = createRuntime();
        const refreshStatus = vi.fn().mockResolvedValue(true);

        startVerificationStatusPolling(refreshStatus, runtime);
        runInterval();
        await flushPromises();

        expect(runtime.clearInterval).toHaveBeenCalledOnce();
        expect(runtime.removeEventListener).toHaveBeenCalledOnce();

        runInterval();
        focus();
        await flushPromises();

        expect(refreshStatus).toHaveBeenCalledOnce();
    });
});
