import { differenceInSeconds, Duration, intervalToDuration } from 'date-fns';
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';

const ZERO_DURATION = {
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
    months: 0,
    years: 0,
};

const labels = ['hours', 'minutes', 'seconds'];

export const Timer: FunctionComponent<
    PropsWithChildren<{
        timestamp: Date;
        callback: () => void;
    }>
> = ({ timestamp, callback }) => {
    const [duration, setDuration] = useState<Duration>(ZERO_DURATION);

    useEffect(() => {
        let timer: string | number | NodeJS.Timeout | undefined;

        setDuration(
            intervalToDuration({
                start: new Date(),
                end: timestamp,
            }),
        );

        // eslint-disable-next-line prefer-const
        timer = setInterval(() => {
            const difference = differenceInSeconds(timestamp, new Date());

            if (difference <= 0) {
                setDuration(ZERO_DURATION);
                clearInterval(timer);

                if (callback) {
                    callback();
                }

                return;
            }

            setDuration(
                intervalToDuration({
                    start: new Date(),
                    end: timestamp,
                }),
            );
        }, 1000);

        return () => {
            clearInterval(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timestamp]);

    return (
        <div className="font-robotoMono row justify-between gap-1.5 leading-6">
            {[
                String(duration.hours || 0).padStart(2, '0'),
                String(duration.minutes || 0).padStart(2, '0'),
                String(duration.seconds || 0).padStart(2, '0'),
            ].map((item, index) => (
                <div key={index} className="col center-all min-w-[76px] gap-2 rounded-lg bg-primary-50 px-2 py-3 text-primary">
                    <div className="text-[24px] leading-none tracking-tight">{item}</div>
                    <div className="text-[13px] uppercase leading-none">{labels[index]}</div>
                </div>
            ))}
        </div>
    );
};
