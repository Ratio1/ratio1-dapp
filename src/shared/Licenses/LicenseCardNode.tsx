import { getNodeInfo } from '@lib/api/oracles';
import { config } from '@lib/config';
import { getShortAddress } from '@lib/utils';
import { Skeleton } from '@nextui-org/skeleton';
import { Spinner } from '@nextui-org/spinner';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EthAddress, License } from 'typedefs/blockchain';
import { LicenseSmallCard } from './LicenseSmallCard';

export const LicenseCardNode = ({ license }: { license: License }) => {
    const [isLoading, setLoading] = useState(license.isLinked);

    const [node, setNode] = useState<{
        alias: string | undefined;
        isOnline: boolean;
    }>();

    useEffect(() => {
        if (license.isLinked) {
            (async () => {
                const [alias, isOnline] = await Promise.all([license.alias, license.isOnline]);

                setNode({
                    alias,
                    isOnline,
                });
                setLoading(false);
            })();
        }
    }, [license.isLinked]);

    useEffect(() => {
        if (license.isLinked && !isLoading && node?.alias === undefined) {
            console.log(`[${getShortAddress(license.nodeAddress, 4, true)}] refetching alias`);
        }
    }, [license.isLinked, isLoading, node]);

    const { data: refetchedNodeInfo } = useQuery({
        queryKey: ['refetchedNodeInfo', license.nodeAddress],
        queryFn: ({ queryKey }) => getNodeInfo(queryKey[1] as EthAddress),
        enabled: license.isLinked && !isLoading && node?.alias === undefined, // alias is undefined only in case of an error
        retry: 5,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (refetchedNodeInfo) {
            console.log(
                `[${getShortAddress(license.nodeAddress, 4, true)}] successfully refetched alias`,
                refetchedNodeInfo.node_alias,
            );

            setNode({
                alias: refetchedNodeInfo.node_alias,
                isOnline: refetchedNodeInfo.node_is_online,
            });
        }
    }, [refetchedNodeInfo]);

    if (!license.isLinked) {
        return null;
    }

    return (
        <LicenseSmallCard>
            <div className="row gap-2.5">
                {isLoading ? (
                    <div className="center-all px-4 py-2">
                        <Spinner size="sm" />
                    </div>
                ) : (
                    <>
                        <div
                            className={clsx('h-9 w-1 rounded-full', {
                                'bg-teal-500': node?.isOnline,
                                'bg-red-500': !node?.isOnline,
                            })}
                        ></div>

                        <div className="col font-medium">
                            {node?.alias === undefined ? (
                                <Skeleton className="mb-1 h-4 min-w-20 rounded-lg" />
                            ) : (
                                <div className="max-w-[176px] overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-5">
                                    {node?.alias}
                                </div>
                            )}

                            <Link
                                to={`${config.explorerUrl}/address/${license.nodeAddress}`}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer text-sm text-slate-400 transition-all hover:opacity-60"
                            >
                                <div className="leading-5">{getShortAddress(license.nodeAddress)}</div>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </LicenseSmallCard>
    );
};
