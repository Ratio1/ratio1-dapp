import { describe, expect, it, vi } from 'vitest';
import {
    startVerificationStatusPolling,
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

describe('startVerificationStatusPolling', () => {
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
