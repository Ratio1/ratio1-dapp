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

const labels = ['H', 'M', 'S'];

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
        <div className="font-robotoMono row gap-1">
            {[
                String(duration.hours || 0).padStart(2, '0'),
                String(duration.minutes || 0).padStart(2, '0'),
                String(duration.seconds || 0).padStart(2, '0'),
            ].map((item, index) => (
                <div key={index} className="center-all h-12 w-12 rounded-xl bg-[#345aad] px-1 py-2 text-white">
                    <div className="leading-none">
                        {item}
                        {labels[index]}
                    </div>
                </div>
            ))}
        </div>
    );
};
