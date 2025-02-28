import { ping } from '@lib/api/backend';
import { Spinner } from '@nextui-org/spinner';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { NetworkSelector } from './NetworkSelector';

function NetworkAndStatus() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['ping'],
        queryFn: ping,
        retry: false,
    });

    return (
        <div className="col gap-2">
            <div className="row mx-auto">
                <NetworkSelector />
            </div>

            <div className="row mx-auto gap-2 rounded-lg bg-slate-200 px-3.5 py-2.5">
                <div className="center-all">
                    {isLoading ? (
                        <Spinner size="sm" className="scale-75" />
                    ) : (
                        <div
                            className={clsx('h-2.5 w-2.5 rounded-full', {
                                'bg-green-500': !error,
                                'bg-red-500': data?.status === 'error' || !!error,
                            })}
                        ></div>
                    )}
                </div>

                <div className="text-sm font-medium text-slate-600">API Status</div>
            </div>
        </div>
    );
}

export default NetworkAndStatus;
