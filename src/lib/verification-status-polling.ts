import { ApplicationStatus } from '@typedefs/profile';

export const verificationStatusRefreshIntervalMs = 5000;

export const trackVerificationOutcome = (initialStatus: string) => {
    let previousStatus = initialStatus;

    return (status: ApplicationStatus) => {
        const changed = status !== previousStatus;
        previousStatus = status;
        return (
            changed &&
            (status === ApplicationStatus.Approved ||
                status === ApplicationStatus.OnHold ||
                status === ApplicationStatus.Rejected ||
                status === ApplicationStatus.FinalRejected)
        );
    };
};

export type VerificationPollingRuntime = {
    setInterval: (handler: () => void, timeout: number) => number;
    clearInterval: (intervalId: number) => void;
    addEventListener: (type: 'focus', listener: () => void) => void;
    removeEventListener: (type: 'focus', listener: () => void) => void;
};

const getBrowserPollingRuntime = (): VerificationPollingRuntime => ({
    setInterval: (handler, timeout) => window.setInterval(handler, timeout),
    clearInterval: (intervalId) => window.clearInterval(intervalId),
    addEventListener: (type, listener) => window.addEventListener(type, listener),
    removeEventListener: (type, listener) => window.removeEventListener(type, listener),
});

export const startVerificationStatusPolling = (
    refreshStatus: () => Promise<boolean>,
    runtime: VerificationPollingRuntime = getBrowserPollingRuntime(),
) => {
    let isStopped = false;
    let isRefreshInFlight = false;

    const stop = () => {
        if (isStopped) return;
        isStopped = true;
        runtime.clearInterval(intervalId);
        runtime.removeEventListener('focus', poll);
    };

    const poll = async () => {
        if (isStopped || isRefreshInFlight) return;
        isRefreshInFlight = true;

        try {
            if (await refreshStatus()) {
                stop();
            }
        } finally {
            isRefreshInFlight = false;
        }
    };

    const intervalId = runtime.setInterval(poll, verificationStatusRefreshIntervalMs);
    runtime.addEventListener('focus', poll);

    return stop;
};
