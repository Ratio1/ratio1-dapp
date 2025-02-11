import { config } from '@lib/config';
import useAwait from '@lib/useAwait';
import { fBI, fN, getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import { Skeleton } from '@nextui-org/skeleton';
import { Spinner } from '@nextui-org/spinner';
import { Timer } from '@shared/Timer';
import clsx from 'clsx';
import { addDays, formatDistanceToNow, isBefore } from 'date-fns';
import { FunctionComponent, PropsWithChildren, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCpuLine, RiExchange2Line, RiLink, RiLinkUnlink, RiMoreFill, RiTimeLine } from 'react-icons/ri';
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
    action?: (type: 'link' | 'unlink' | 'claim' | 'changeNode', license: License) => void;
    isExpanded: boolean;
    disableActions?: boolean;
}) => {
    // The license can only be linked once every 24h
    const [rewards, isLoadingRewards] = useAwait(license.isLinked ? license.rewards : 0n);
    const [nodeAlias, isLoadingNodeAlias] = useAwait(license.isLinked ? license.alias : '');
    const [isNodeOnline, isLoadingNodeState] = useAwait(license.isLinked ? license.isOnline : false);

    const getAssignTimestamp = (): Date => new Date(Number(license.assignTimestamp) * 1000);
    const getCooldownEndTimestamp = (): Date => addDays(getAssignTimestamp(), 1);

    const [hasCooldown, setCooldown] = useState<boolean>(isBefore(new Date(), getCooldownEndTimestamp()));

    const getContractAddress = (type: 'ND' | 'MND' | 'GND') => {
        switch (type) {
            case 'ND':
                return config.ndContractAddress;

            default:
                return config.mndContractAddress;
        }
    };

    const getLicenseId = () => (
        <Link
            to={`${config.explorerUrl}/token/${getContractAddress(license.type)}?a=${Number(license.licenseId)}`}
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
        <Card>
            <div className="col gap-2">
                <div className="flex">{getLicenseId()}</div>
                <div className="w-48">{getLicenseUsageStats()}</div>
            </div>
        </Card>
    );

    const getLicenseCooldownTimer = () => (
        <>
            {!license.isLinked && hasCooldown && (
                <Tag>
                    <div className="row gap-1">
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
            )}
        </>
    );

    const getNodeCard = () => (
        <>
            {license.isLinked && (
                <Card>
                    <div className="row gap-2.5">
                        {isLoadingNodeAlias || isLoadingNodeState ? (
                            <div className="center-all px-4 py-2">
                                <Spinner size="sm" />
                            </div>
                        ) : (
                            <>
                                <div
                                    className={clsx('h-9 w-1 rounded-full', {
                                        'bg-teal-500': isNodeOnline,
                                        'bg-red-500': !isNodeOnline,
                                    })}
                                ></div>

                                <div className="col gap-0.5 font-medium">
                                    {!!nodeAlias && (
                                        <div className="max-w-[176px] overflow-hidden text-ellipsis whitespace-nowrap leading-none">
                                            {nodeAlias}
                                        </div>
                                    )}

                                    <Link
                                        to={`${config.explorerUrl}/address/${license.nodeAddress}`}
                                        target="_blank"
                                        onClick={(e) => e.stopPropagation()}
                                        className="cursor-pointer text-sm text-slate-400 transition-all hover:opacity-60"
                                    >
                                        <div className="leading-none">{getShortAddress(license.nodeAddress)}</div>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </>
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
            <div className="row gap-1.5 text-lg font-semibold">
                <div className="text-slate-400">~$R1</div>
                <div className="text-primary">{fN(rewardsN)}</div>
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
                                    <div className="font-medium text-body">Link</div>
                                    <div className="text-xs text-slate-500">Assign license to a node</div>
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
                                    <div className="font-medium text-body">Change Node</div>
                                    <div className="text-xs text-slate-500">Switch license to another node</div>
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
                                    <div className="font-medium text-body">Unlink</div>
                                    <div className="text-xs text-slate-500">Remove license from node</div>
                                </div>
                            </div>
                        </DropdownItem>
                    </>
                )}
            </DropdownMenu>
        </Dropdown>
    );

    const getBannedLicenseTag = () => <Tag>Banned</Tag>;

    return (
        <>
            <div
                className={clsx(
                    'flex flex-col-reverse justify-between gap-8 bg-white px-8 py-6 larger:flex-row larger:items-center',
                    {
                        'rounded-bl-3xl rounded-br-3xl': isExpanded,
                    },
                )}
            >
                {/* Info */}
                <div className="row flex-1 flex-wrap justify-center gap-2 sm:justify-start sm:gap-4 min-[680px]:gap-4">
                    {getLicenseCard()}
                    {getNodeCard()}
                </div>

                {/* Controls */}
                <div className="flex justify-end">
                    {license.isBanned ? (
                        <>{getBannedLicenseTag()}</>
                    ) : (
                        <>
                            {!disableActions && (
                                <div className="row gap-4">
                                    {getLicenseCooldownTimer()}

                                    {license.isLinked && (
                                        <div className="row gap-4">
                                            {getNodeRewards()}
                                            {getClaimRewardsButton()}
                                        </div>
                                    )}

                                    {getDropdown()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

const Card: FunctionComponent<PropsWithChildren> = ({ children }) => (
    <div className="center-all h-[64px] rounded-2xl border-2 border-slate-100 px-4 py-2.5">{children}</div>
);

const Tag: FunctionComponent<PropsWithChildren> = ({ children }) => (
    <div className="flex">
        <div className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600">{children}</div>
    </div>
);
