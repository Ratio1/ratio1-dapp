import { Skeleton } from '@heroui/skeleton';
import useAwait from '@lib/useAwait';
import { getR1ExplorerUrl } from '@lib/config';
import { getShortAddressOrHash } from '@lib/utils';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { License } from 'typedefs/blockchain';
import { LicenseSmallCard } from './LicenseSmallCard';

export const LicenseCardNode = ({ license }: { license: License }) => {
    // Every card observes the same wallet batch. The page refresh or explicit Retry supplies the next sample.
    const [alias, loadingAlias] = useAwait(license.isLinked ? license.alias : undefined);
    const [online, loadingStatus] = useAwait(license.isLinked ? license.isOnline : undefined);

    if (!license.isLinked) {
        return null;
    }

    return (
        <LicenseSmallCard>
            <div className="row gap-2.5">
                {loadingAlias || loadingStatus ? (
                    <div className="col gap-1.5 py-1.5">
                        <Skeleton className="h-4 w-24 rounded-lg" />
                        <Skeleton className="h-4 w-28 rounded-lg" />
                    </div>
                ) : (
                    <>
                        <div
                            className={clsx('h-9 w-1 rounded-full', {
                                'bg-teal-500': online === true,
                                'bg-red-500': online === false,
                                'bg-slate-300': online === undefined,
                            })}
                        ></div>

                        <div className="col font-medium">
                            <div className="max-w-[176px] overflow-hidden text-sm leading-5 text-ellipsis whitespace-nowrap">
                                {alias && alias !== 'missing_id' ? alias : 'Node name unavailable'}
                            </div>

                            <Link
                                to={`${getR1ExplorerUrl()}/node/${license.nodeAddress}`}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer text-sm text-slate-400 transition-all hover:opacity-60"
                            >
                                <div className="leading-5">{getShortAddressOrHash(license.nodeAddress)}</div>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </LicenseSmallCard>
    );
};
