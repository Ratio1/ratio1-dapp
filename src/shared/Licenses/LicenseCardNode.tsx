import { getNodeInfo } from '@lib/api/oracles';
import { getR1ExplorerUrl } from '@lib/config';
import { getShortAddress } from '@lib/utils';
import { Skeleton } from "@heroui/skeleton";
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

            // Refetching node status every minute
            const interval = setInterval(() => {
                refetch();
            }, 60000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [license.isLinked]);

    const {
        data: refetchedNodeInfo,
        refetch,
        isFetching: isLoadingQuery,
    } = useQuery({
        queryKey: ['refetchedNodeInfo', license.nodeAddress],
        queryFn: async ({ queryKey }) => {
            const nodeEthAddress = queryKey[1] as EthAddress;
            // console.log(`[Query] Fetching node info for address: ${nodeEthAddress}`);

            const nodeInfo = await getNodeInfo(nodeEthAddress);
            // console.log(`[Query] Received node info:`, nodeInfo);

            // Check if the alias is 'missing_id' and throw an error to trigger the retry
            if (nodeInfo.node_alias === 'missing_id') {
                // console.log(`[Query] Node alias is 'missing_id', throwing error to trigger retry`);
                throw new Error('Node alias is missing_id - retrying...');
            }

            return nodeInfo;
        },
        enabled: license.isLinked && !isLoading && (node?.alias === undefined || node?.alias === 'missing_id'), // alias is undefined only in case of an error
        retry: (failureCount, error) => {
            // console.log(`[Query] Retry attempt ${failureCount + 1}/8 for node ${license.nodeAddress}`, error);
            return failureCount < 8;
        },
        retryDelay: (attemptIndex) => {
            const delay = 5000; // 5 seconds
            // console.log(`[Query] Waiting ${delay}ms before retry ${attemptIndex + 1}`);
            return delay;
        },
        refetchInterval: 5000,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (refetchedNodeInfo) {
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
                {isLoading || isLoadingQuery ? (
                    <div className="col gap-1.5 py-1.5">
                        <Skeleton className="h-4 w-24 rounded-lg" />
                        <Skeleton className="h-4 w-28 rounded-lg" />
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
                                <Skeleton className="mb-1 h-4 min-w-24 rounded-lg" />
                            ) : (
                                <div className="max-w-[176px] overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-5">
                                    {node?.alias}
                                </div>
                            )}

                            <Link
                                to={`${getR1ExplorerUrl()}/node/${license.nodeAddress}`}
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
