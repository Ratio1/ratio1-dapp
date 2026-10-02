import { useEffect, useState } from 'react';

function useAwait<T>(value: Promise<T> | T) {
    const [settled, setSettled] = useState<{ promise: Promise<T>; value?: T; error?: Error }>();
    const isPromise = value instanceof Promise;
    const awaiting = isPromise && settled?.promise !== value;
    const finalValue = isPromise ? (awaiting ? undefined : settled?.value) : value;

    useEffect(() => {
        if (!(value instanceof Promise)) return;
        let canceled = false;
        value.then(
            (output) => {
                if (!canceled) {
                    setSettled({ promise: value, value: output });
                }
            },
            (error: unknown) => {
                if (!canceled) {
                    setSettled({ promise: value, error: error instanceof Error ? error : new Error(String(error)) });
                }
            },
        );
        return () => {
            canceled = true;
        };
    }, [value]);

    return [finalValue, awaiting, isPromise && !awaiting ? settled?.error : undefined] as const;
}

export default useAwait;
