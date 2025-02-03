import { explorerUrl, getContractAddress } from '@lib/config';
import useAwait from '@lib/useAwait';
import { fBI, getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import { Skeleton } from '@nextui-org/skeleton';
import { Timer } from '@shared/Timer';
import clsx from 'clsx';
import { addDays, isBefore } from 'date-fns';
import { round } from 'lodash';
import { useState } from 'react';
import { RiCpuLine, RiForbid2Line, RiLink, RiLinkUnlink, RiMoreFill, RiTimeLine, RiWalletLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { License } from 'typedefs/blockchain';
import { formatUnits } from 'viem';

export const LicenseCardHeader = ({
    license,
    action,
    isExpanded,
    disableActions,
}: {
    license: License;
    action?: (type: 'link' | 'unlink' | 'claim', license: License) => void;
    isExpanded: boolean;
    disableActions?: boolean;
}) => {
    // The license can only be linked once every 24h
    const [rewards, isLoadingRewards] = useAwait(license.isLinked ? license.rewards : 0n);
    const [alias, isLoadingAlias] = useAwait(license.isLinked ? license.alias : '');
    const [isOnline, isLoadingState] = useAwait(license.isLinked ? license.isOnline : false);

    const getAssignTimestamp = (): Date => new Date(Number(license.assignTimestamp) * 1000);
    const getCooldownEndTimestamp = (): Date => addDays(getAssignTimestamp(), 1);

    const [hasCooldown, setCooldown] = useState<boolean>(isBefore(new Date(), getCooldownEndTimestamp()));

    const getNodeInfoSection = () => (
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
            {isLoadingAlias || isLoadingState ? (
                <Skeleton className="h-4 w-full max-w-36 rounded-lg" />
            ) : (
                <div className="row gap-2">
                    <div
                        className={clsx('h-2.5 w-2.5 rounded-full', {
                            'bg-green-500': isOnline,
                            'bg-red-500': !isOnline,
                        })}
                    ></div>
                    <div>{alias}</div>
                </div>
            )}
        </div>
    );

    const getLicenseIdTag = () => (
        <Link
            to={`${explorerUrl}/token/${getContractAddress(license.type)}?a=${Number(license.licenseId)}`}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className={clsx('rounded-full px-3 py-2 text-sm font-medium transition-all hover:opacity-60', {
                'bg-[#e0eeff] text-primary': license.isLinked,
                'bg-purple-100 text-purple-600': !license.isLinked,
            })}
        >
            <div className="row gap-1">
                <RiCpuLine className="text-base" />
                <div>License #{Number(license.licenseId)}</div>
            </div>
        </Link>
    );

    const getLicenseCooldownTimer = () => (
        <>
            {!license.isLinked && hasCooldown && (
                <div className="rounded-full bg-red-100 px-3 py-2 text-sm text-red-600">
                    <div className="row gap-1 font-medium">
                        <RiTimeLine className="text-base" />
                        <span className="font-medium">Linkable in</span>{' '}
                        <Timer
                            variant="compact"
                            timestamp={getCooldownEndTimestamp()}
                            callback={() => {
                                setCooldown(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );

    const getNodeAddressTag = () => (
        <>
            {license.isLinked && (
                <Link
                    to={`${explorerUrl}/address/${license.nodeAddress}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full bg-orange-100 px-3 py-2 text-sm font-medium text-orange-600 transition-all hover:opacity-60"
                >
                    <div className="row gap-1">
                        <RiWalletLine className="text-base" />
                        <div>{getShortAddress(license.nodeAddress)}</div>
                    </div>
                </Link>
            )}
        </>
    );

    const getLicenseUsageStats = () => (
        <div className="col gap-2">
            <div className="row justify-between text-sm font-medium leading-none">
                <div>
                    {fBI(license.totalClaimedAmount, 18)}/{fBI(license.totalAssignedAmount, 18)}
                </div>

                <div>{round(Number((license.totalClaimedAmount * 100n) / license.totalAssignedAmount), 1)}%</div>
            </div>

            <div className="flex h-1 overflow-hidden rounded-full bg-gray-300">
                <div
                    className="rounded-full bg-primary transition-all"
                    style={{ width: `${Number((license.totalClaimedAmount * 100n) / license.totalAssignedAmount)}%` }}
                ></div>
            </div>
        </div>
    );

    const getNodeRewards = () => {
        const rewardsN: number = Number(formatUnits(rewards ?? 0n, 18));
        const hasRewards = rewardsN > 0;

        if (!isLoadingRewards && !hasRewards) {
            return undefined;
        }

        return isLoadingRewards ? (
            <Skeleton className="h-4 min-w-20 rounded-lg" />
        ) : (
            <div className="row gap-1.5">
                <div className="text-base font-semibold text-slate-400 xl:text-lg">$R1</div>
                <div className="text-base font-semibold text-primary xl:text-lg">{parseFloat(rewardsN.toFixed(2))}</div>
            </div>
        );
    };

    const getClaimRewardsButton = () => {
        const rewardsN: number = Number(formatUnits(rewards ?? 0n, 18));
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
                isDisabled={isLoadingRewards || !hasRewards}
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
                disabledKeys={['title', ...(hasCooldown ? ['link'] : [])]}
                itemClasses={{
                    base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-lightBlue',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                    ],
                }}
            >
                <DropdownItem key="title" isReadOnly>
                    <div className="text-sm text-slate-700">Actions</div>
                </DropdownItem>

                {!license.isLinked ? (
                    <DropdownItem
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
                                <div className="font-medium text-body">Link</div>
                                <div className="text-xs text-slate-500">Assign license to a node</div>
                            </div>
                        </div>
                    </DropdownItem>
                ) : (
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
                                <div className="font-medium text-body">Unlink</div>
                                <div className="text-xs text-slate-500">Remove license from node</div>
                            </div>
                        </div>
                    </DropdownItem>
                )}
            </DropdownMenu>
        </Dropdown>
    );

    const getBannedLicenseTag = () => (
        <>
            {license.isBanned && (
                <div className="rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-600">
                    <div className="row gap-1">
                        <RiForbid2Line className="text-base" />
                        <div>Banned</div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <>
            {/* Web */}
            <div
                className={clsx('web-only-xl-flex row justify-between px-8 py-7', {
                    'rounded-bl-3xl rounded-br-3xl': isExpanded,
                    'bg-white': license.isLinked,
                })}
            >
                <div className="row">
                    <div className="row gap-3 lg:min-w-[522px]">
                        {license.isLinked && <div className="w-[194px]">{getNodeInfoSection()}</div>}

                        <div
                            className={clsx('flex', {
                                'min-w-[150px]': license.isLinked,
                                'min-w-[194px]': !license.isLinked,
                            })}
                        >
                            {getLicenseIdTag()}
                        </div>

                        {getLicenseCooldownTimer()}

                        {getNodeAddressTag()}
                    </div>

                    <div className="w-40">{getLicenseUsageStats()}</div>
                </div>

                {!disableActions && !license.isBanned && (
                    <div className="row gap-4">
                        {license.isLinked && (
                            <div className="row gap-4">
                                {getNodeRewards()}

                                {getClaimRewardsButton()}
                            </div>
                        )}

                        {getDropdown()}
                    </div>
                )}

                {getBannedLicenseTag()}
            </div>

            {/* Mobile */}
            <div
                className={clsx('mobile-only-xl-flex col items-baseline gap-5 px-5 py-5 md:px-8 md:py-7', {
                    'rounded-bl-3xl rounded-br-3xl': isExpanded,
                    'bg-white': license.isLinked,
                })}
            >
                <div
                    className={clsx(
                        'flex w-full gap-4 min-[522px]:flex-row min-[522px]:items-center min-[522px]:justify-between',
                        {
                            'flex-col-reverse': license.isLinked,
                            'flex-direction-row justify-between': !license.isLinked,
                        },
                    )}
                >
                    {license.isLinked ? (
                        <div className="min-[522px]:max-w-44 lg:max-w-max">{getNodeInfoSection()}</div>
                    ) : (
                        <div className="flex">{getLicenseIdTag()}</div>
                    )}

                    {/* Controls */}
                    <div className="row justify-end">
                        {!disableActions && !license.isBanned && (
                            <div className="row gap-2 lg:gap-4">
                                {license.isLinked && (
                                    <div className="row gap-2 lg:gap-4">
                                        {getNodeRewards()}

                                        {getClaimRewardsButton()}
                                    </div>
                                )}

                                {getDropdown()}
                            </div>
                        )}

                        {getBannedLicenseTag()}
                    </div>
                </div>

                {license.isLinked && (
                    <div className="flex w-full justify-between gap-4 min-[522px]:-mt-2 min-[522px]:justify-start">
                        {getLicenseIdTag()}

                        {getNodeAddressTag()}
                    </div>
                )}

                {getLicenseCooldownTimer()}

                <div className="w-full">{getLicenseUsageStats()}</div>
            </div>
        </>
    );
};
