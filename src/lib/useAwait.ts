import { useEffect, useState } from 'react';

export default function useAwait<T>(value: Promise<T> | T) {
    const [awaitedValue, setAwaitedValue] = useState<T>();
    const [awaiting, setAwaiting] = useState(false);
    const finalValue = value instanceof Promise ? awaitedValue : value;

    useEffect(() => {
        if (!(value instanceof Promise)) return;
        let canceled = false;
        setAwaitedValue(undefined);
        setAwaiting(true);
        value.then((output) => {
            if (!canceled) {
                setAwaitedValue(output);
                setAwaiting(false);
            }
        });
        return () => {
            canceled = true;
        };
    }, [value]);

    return [finalValue, awaiting] as const;
}
