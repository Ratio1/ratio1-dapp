import useAwait from '@lib/useAwait';
import { fBI, getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import clsx from 'clsx';
import { addDays, isBefore } from 'date-fns';
import { round } from 'lodash';
import { RiCloseCircleLine, RiCpuLine, RiLink, RiLinkUnlink, RiMoreFill, RiTimeLine, RiWalletLine } from 'react-icons/ri';
import { License } from 'types';
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
    const [rewards, isLoadingRewards] = useAwait(license.isLinked ? license.rewards : 0n);
    const [alias, isLoadingAlias] = useAwait(license.isLinked ? license.alias : '');

    // The license can only be linked once every 24h
    const hasCooldown = () => {
        return isBefore(new Date(), addDays(Number(license.assignTimestamp), 1));
    };

    return (
        <div
            className={clsx('row justify-between px-8 py-7', {
                'rounded-bl-3xl rounded-br-3xl': isExpanded,
                'bg-white': license.isLinked,
            })}
        >
            <div className="row">
                <div className="row min-w-[550px] gap-3">
                    {license.isLinked && <div className="min-w-[184px] font-medium">{isLoadingAlias ? '...' : alias}</div>}

                    <div
                        className={clsx('flex', {
                            'min-w-[150px]': license.isLinked,
                            'min-w-[184px]': !license.isLinked,
                        })}
                    >
                        <div
                            className={clsx('rounded-full px-3 py-2 text-sm font-medium', {
                                'bg-[#e0eeff] text-primary': license.isLinked,
                                'bg-purple-100 text-purple-600': !license.isLinked,
                            })}
                        >
                            <div className="row gap-1">
                                <RiCpuLine className="text-base" />
                                <div>License #{Number(license.licenseId)}</div>
                            </div>
                        </div>
                    </div>

                    {!license.isLinked && hasCooldown() && (
                        <div className="rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-600">
                            <div className="row gap-1">
                                <RiTimeLine className="text-base" />
                                <div>Linkable after {addDays(Number(license.assignTimestamp), 1).toLocaleString()}</div>
                            </div>
                        </div>
                    )}

                    {license.isLinked && (
                        <div className="rounded-full bg-orange-100 px-3 py-2 text-sm font-medium text-orange-600">
                            <div className="row gap-1">
                                <RiWalletLine className="text-base" />
                                <div>{getShortAddress(license.nodeAddress)}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col gap-2">
                    <div className="row justify-between text-sm font-medium leading-none">
                        <div>
                            {fBI(license.totalClaimedAmount, 18)}/{fBI(license.totalAssignedAmount, 18)}
                        </div>

                        <div>{round(Number((license.totalClaimedAmount * 100n) / license.totalAssignedAmount), 1)}%</div>
                    </div>

                    <div className="flex h-1 w-40 overflow-hidden rounded-full bg-gray-300">
                        <div
                            className="rounded-full bg-primary transition-all"
                            style={{ width: `${Number((license.totalClaimedAmount * 100n) / license.totalAssignedAmount)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {!disableActions && !license.isBanned && (
                <div className="row gap-4">
                    {license.isLinked && (
                        <div className="row gap-4">
                            <div className="row gap-1.5">
                                <div className="text-lg font-semibold text-slate-400">$R1</div>
                                <div className="text-lg font-semibold text-primary">
                                    {isLoadingRewards ? '...' : Number(formatUnits(rewards ?? 0n, 18)).toFixed(2)}
                                </div>
                            </div>

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
                            >
                                <div className="text-sm">Claim</div>
                            </Button>
                        </div>
                    )}

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
                            disabledKeys={['title', ...(hasCooldown() ? ['link'] : [])]}
                            itemClasses={{
                                base: [
                                    'rounded-md',
                                    'text-default-500',
                                    'transition-opacity',
                                    'data-[hover=true]:text-foreground',
                                    'data-[hover=true]:bg-lightAccent',
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
                </div>
            )}

            {license.isBanned && (
                <div className="rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-600">
                    <div className="row gap-1">
                        <RiCloseCircleLine className="text-base" />
                        <div>Banned</div>
                    </div>
                </div>
            )}
        </div>
    );
};
