import { MNDContractAbi } from '@blockchain/MNDContract';
import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown';
import { Skeleton } from '@heroui/skeleton';
import { config, getDevAddress, getR1ExplorerUrl, isUsingDevAddress } from '@lib/config';
import useAwait from '@lib/useAwait';
import { fBI, fN } from '@lib/utils';
import SyncingOraclesTag from '@shared/SyncingOraclesTag';
import { Timer } from '@shared/Timer';
import clsx from 'clsx';
import { addDays, formatDistanceToNow, isBefore } from 'date-fns';
import { FunctionComponent, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCpuLine, RiExchange2Line, RiFireLine, RiLink, RiLinkUnlink, RiMoreFill, RiTimeLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { License } from 'typedefs/blockchain';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { LicenseCardNode } from './LicenseCardNode';
import { LicenseSmallCard } from './LicenseSmallCard';

export const LicenseCardHeader = ({
    license,
    isClaimingAll,
    action,
    isExpanded,
    disableActions,
}: {
    license: License;
    isClaimingAll?: boolean;
    action?: (type: 'link' | 'unlink' | 'claim' | 'changeNode' | 'burn', license: License) => void;
    isExpanded: boolean;
    disableActions?: boolean;
}) => {
    const publicClient = usePublicClient();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const [isLoadingRewards, setLoadingRewards] = useState<boolean>(true);
    const [isClaimDisabled, setClaimDisabled] = useState<boolean>(true);

    // Rewards
    const [rewardsTotal, setRewardsTotal] = useState<bigint | undefined>();
    const [licenseRewardsPoA, setLicenseRewardsPoA] = useState<bigint | undefined>();
    const licenseRewardsPoAI: bigint | undefined = license.type === 'ND' ? license.r1PoaiRewards || undefined : undefined;

    // Used to restrict actions until all data is loaded
    const [_, isLoadingNodeAlias] = useAwait(license.isLinked ? license.alias : undefined);

    const getAssignTimestamp = (): Date => new Date(Number(license.assignTimestamp) * 1000);
    const getCooldownEndTimestamp = (): Date => addDays(getAssignTimestamp(), 1);

    const [hasCooldown, setCooldown] = useState<boolean>(isBefore(new Date(), getCooldownEndTimestamp()));

    const shouldShowBurnButtonPromise = useMemo(async () => {
        if (!publicClient || !address) {
            return false;
        }
        if (license.type !== 'MND') {
            return false;
        }

        return publicClient.readContract({
            address: config.mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'initiatedBurn',
            args: [address],
        });
    }, [license]);

    const [shouldShowBurnButton] = useAwait(shouldShowBurnButtonPromise);

    useEffect(() => {
        if (license.isLinked) {
            (async () => {
                try {
                    setClaimDisabled(true);
                    const rewardsPoA = await license.rewards;
                    setLicenseRewardsPoA(rewardsPoA);

                    setRewardsTotal(
                        rewardsPoA !== undefined || licenseRewardsPoAI !== undefined
                            ? (rewardsPoA ?? 0n) + (licenseRewardsPoAI ?? 0n)
                            : undefined,
                    );
                } catch (error) {
                    console.log(`[LicenseCardHeader] Error fetching rewards for license #${Number(license.licenseId)}`, error);
                } finally {
                    setLoadingRewards(false);
                    setClaimDisabled(false);
                }
            })();
        }
    }, [license, license.isLinked]);

    const getLicenseId = () => (
        <Link
            to={`${getR1ExplorerUrl()}/license/${license.type}/${Number(license.licenseId)}`}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className={clsx('cursor-pointer transition-all hover:opacity-60', {
                'text-primary': license.isLinked,
                'text-red-500': license.isBanned,
                'text-slate-500': !license.isLinked,
            })}
        >
            <div className="row gap-1">
                <RiCpuLine className="text-lg" />
                <div className="text-sm font-medium leading-none">License #{Number(license.licenseId)}</div>
            </div>
        </Link>
    );

    const getLicenseUsageStats = () => (
        <div className="row gap-2.5 text-sm font-medium leading-none">
            <div>
                {fBI(license.totalClaimedAmount, 18)}/{fBI(license.totalAssignedAmount, 18)}
            </div>

            <div className="flex h-1 w-full overflow-hidden rounded-full bg-gray-300">
                <div
                    className="rounded-full bg-primary transition-all"
                    style={{ width: `${Number((license.totalClaimedAmount * 100n) / license.totalAssignedAmount)}%` }}
                ></div>
            </div>

            <div>
                {parseFloat(((Number(license.totalClaimedAmount) / Number(license.totalAssignedAmount)) * 100).toFixed(2))}%
            </div>
        </div>
    );

    const getLicenseCard = () => (
        <LicenseSmallCard>
            <div className="col gap-2">
                <div className="flex">{getLicenseId()}</div>
                <div className="w-52">{getLicenseUsageStats()}</div>
            </div>
        </LicenseSmallCard>
    );

    const getLicenseCooldownTimer = () => (
        <>
            {!!hasCooldown && (
                <div className="flex">
                    <Tag>
                        <div className="row gap-1 whitespace-nowrap">
                            <RiTimeLine className="text-base" />
                            <span>Linkable in</span>{' '}
                            <Timer
                                variant="compact"
                                timestamp={getCooldownEndTimestamp()}
                                callback={() => {
                                    setCooldown(false);
                                }}
                            />
                        </div>
                    </Tag>
                </div>
            )}
        </>
    );

    const getNodeCard = () => <LicenseCardNode license={license} />;

    const getNodeRewards = () => {
        if (!isLoadingRewards && rewardsTotal === undefined) {
            return <SyncingOraclesTag variant="default" />;
        }

        const nRewardsPoA: number = Number(formatUnits(licenseRewardsPoA ?? 0n, 18));
        const nRewardsPoAI: number = Number(formatUnits(licenseRewardsPoAI ?? 0n, 18));

        const hasRewards = nRewardsPoA > 0 || nRewardsPoAI > 0;

        if (!isLoadingRewards && !hasRewards) {
            return undefined;
        }

        return isLoadingRewards ? (
            <Skeleton className="h-5 min-w-28 rounded-lg" />
        ) : (
            <div className="row gap-1.5 font-medium text-slate-400">
                <div className="whitespace-nowrap">~$R1</div>

                {!!nRewardsPoA && (
                    <>
                        PoA
                        <div className="font-semibold text-primary">{fN(nRewardsPoA)}</div>
                    </>
                )}

                {!!nRewardsPoAI && (
                    <>
                        PoAI
                        <div className="font-semibold text-primary">{fN(nRewardsPoAI)}</div>
                    </>
                )}
            </div>
        );
    };

    const getClaimRewardsButton = () => {
        const rewardsN: number = Number(formatUnits(rewardsTotal ?? 0n, 18));
        const hasRewards = rewardsN > 0;

        return (
            <Button
                className="h-9"
                color="primary"
                size="sm"
                variant="solid"
                onPress={() => {
                    if (action) {
                        action('claim', license);
                    }
                }}
                isLoading={license.isClaimingRewards}
                isDisabled={isClaimingAll || isLoadingRewards || !hasRewards || isClaimDisabled}
            >
                <div className="text-sm">Claim</div>
            </Button>
        );
    };

    const getDropdown = () => (
        <Dropdown placement="bottom-end" shouldBlockScroll={false} radius="sm">
            <DropdownTrigger>
                <Button
                    className="h-9 min-w-9 rounded-lg border border-default-200 bg-[#fcfcfd] p-0"
                    color="default"
                    variant="bordered"
                    size="md"
                    disableRipple
                >
                    <RiMoreFill className="text-[18px]" />
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                aria-label="Dropdown"
                variant="flat"
                disabledKeys={[
                    'title',
                    ...(hasCooldown ? ['link'] : []),
                    ...(isLoadingRewards || isLoadingNodeAlias || rewardsTotal === undefined ? ['unlink', 'changeNode'] : []),
                ]}
                itemClasses={{
                    base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-slate-100',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                    ],
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <DropdownItem key="title" isReadOnly>
                    <div className="text-sm text-slate-700">Actions</div>
                </DropdownItem>

                {!license.isLinked ? (
                    <>
                        <DropdownItem
                            id="link"
                            aria-label="Link"
                            key="link"
                            onPress={() => {
                                if (action) {
                                    action('link', license);
                                }
                            }}
                        >
                            <div className="row gap-2">
                                <RiLink className="pr-0.5 text-[22px] text-slate-500" />

                                <div className="col">
                                    <div className="font-medium leading-4 text-body">Link</div>
                                    <div className="text-[13px] text-slate-500">Assign license to a node</div>
                                </div>
                            </div>
                        </DropdownItem>
                    </>
                ) : (
                    <>
                        <DropdownItem
                            key="changeNode"
                            onPress={() => {
                                if (hasCooldown) {
                                    toast.error(
                                        `License can be linked again in ${formatDistanceToNow(getCooldownEndTimestamp())}.`,
                                    );
                                } else if (action) {
                                    action('changeNode', license);
                                }
                            }}
                        >
                            <div className="row gap-2">
                                <RiExchange2Line className="pr-0.5 text-[22px] text-slate-500" />

                                <div className="col">
                                    <div className="font-medium leading-4 text-body">Change Node</div>
                                    <div className="text-[13px] text-slate-500">Switch license to another node</div>
                                </div>
                            </div>
                        </DropdownItem>

                        <DropdownItem
                            key="unlink"
                            onPress={() => {
                                if (action) {
                                    action('unlink', license);
                                }
                            }}
                        >
                            <div className="row gap-2">
                                <RiLinkUnlink className="pr-0.5 text-[22px] text-slate-500" />

                                <div className="col">
                                    <div className="font-medium leading-4 text-body">Unlink</div>
                                    <div className="text-[13px] text-slate-500">Remove license from node</div>
                                </div>
                            </div>
                        </DropdownItem>
                    </>
                )}

                {shouldShowBurnButton ? (
                    <DropdownItem
                        id="burn"
                        aria-label="Burn"
                        key="burn"
                        onPress={() => {
                            if (action) {
                                action('burn', license);
                            }
                        }}
                    >
                        <div className="row gap-2">
                            <RiFireLine className="pr-0.5 text-[22px] text-red-500" />

                            <div className="col">
                                <div className="font-medium leading-4 text-red-500">Burn</div>
                                <div className="text-[13px] text-slate-500">Permanently erase the license</div>
                            </div>
                        </div>
                    </DropdownItem>
                ) : null}
            </DropdownMenu>
        </Dropdown>
    );

    const getBannedLicenseTag = () => <Tag>Banned</Tag>;

    return (
        <div
            className={clsx(
                'flex flex-col-reverse justify-between gap-4 bg-white px-4 py-3 md:gap-6 lg:gap-8 larger:flex-row larger:items-center',
                {
                    'rounded-bl-2xl rounded-br-2xl': isExpanded,
                },
            )}
        >
            {/* On mobile, the rewards and claim button are displayed in the bottom row, but 'flex-col-reverse' is used */}
            {!!rewardsTotal && (
                <div className="row justify-between sm:hidden">
                    {getNodeRewards()}
                    {getClaimRewardsButton()}
                </div>
            )}

            {/* Info */}
            <div className="row flex-1 flex-wrap gap-2 sm:gap-4">
                {getLicenseCard()}
                {getNodeCard()}
            </div>

            {/* Controls */}
            <div className="flex flex-0 justify-end">
                {license.isBanned ? (
                    <>{getBannedLicenseTag()}</>
                ) : (
                    <>
                        {!disableActions && (
                            <div className="row w-full justify-between gap-4 sm:w-auto sm:justify-start">
                                {license.isLinked ? (
                                    <div className="hidden items-center gap-4 sm:flex">
                                        {getNodeRewards()}
                                        {getClaimRewardsButton()}
                                    </div>
                                ) : (
                                    <>{getLicenseCooldownTimer()}</>
                                )}

                                <div className="flex w-full justify-end">{getDropdown()}</div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const Tag: FunctionComponent<PropsWithChildren> = ({ children }) => (
    <div className="flex">
        <div className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600">{children}</div>
    </div>
);
