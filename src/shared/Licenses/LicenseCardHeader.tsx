import { LICENSE_CAP } from '@lib/config';
import { fN, getShortAddress, isLicenseAssigned } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import clsx from 'clsx';
import { round } from 'lodash';
import { RiCpuLine, RiLink, RiLinkUnlink, RiMoreFill, RiTimeLine, RiWalletLine } from 'react-icons/ri';
import { AssignedLicense, UnassignedLicense } from 'types';

export const LicenseCardHeader = ({
    license,
    isExpanded,
    disableActions,
}: {
    license: UnassignedLicense | AssignedLicense;
    isExpanded: boolean;
    disableActions?: boolean;
}) => {
    return (
        <div
            className={clsx('row justify-between px-8 py-7', {
                'rounded-bl-3xl rounded-br-3xl': isExpanded,
                'bg-white': isLicenseAssigned(license),
            })}
        >
            <div className="row">
                <div className="row min-w-[550px] gap-3">
                    {isLicenseAssigned(license) && <div className="min-w-[184px] font-medium">{license.alias}</div>}

                    <div
                        className={clsx('flex', {
                            'min-w-[150px]': isLicenseAssigned(license),
                            'min-w-[184px]': !isLicenseAssigned(license),
                        })}
                    >
                        <div
                            className={clsx('rounded-full px-3 py-2 text-sm font-medium', {
                                'bg-[#e0eeff] text-primary': isLicenseAssigned(license),
                                'bg-purple-100 text-purple-600': !isLicenseAssigned(license),
                            })}
                        >
                            <div className="row gap-1">
                                <RiCpuLine className="text-base" />
                                <div>License #{license.id}</div>
                            </div>
                        </div>
                    </div>

                    {!isLicenseAssigned(license) && license.cooldownTimestamp && (
                        <div className="rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-600">
                            <div className="row gap-1">
                                <RiTimeLine className="text-base" />
                                <div>Useable after {license.cooldownTimestamp.toLocaleString()}</div>
                            </div>
                        </div>
                    )}

                    {isLicenseAssigned(license) && (
                        <div className="rounded-full bg-orange-100 px-3 py-2 text-sm font-medium text-orange-600">
                            <div className="row gap-1">
                                <RiWalletLine className="text-base" />
                                <div>{getShortAddress(license.node_address)}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="row justify-between text-sm font-medium leading-none">
                        <div>
                            {fN(license.used)}/{fN(LICENSE_CAP)}
                        </div>

                        <div>{round((license.used * 100) / LICENSE_CAP, 1)}%</div>
                    </div>

                    <div className="flex h-1 w-40 overflow-hidden rounded-full bg-gray-300">
                        <div
                            className="rounded-full bg-primary transition-all"
                            style={{ width: `${(license.used * 100) / LICENSE_CAP}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {!disableActions && (
                <div className="row gap-4">
                    {isLicenseAssigned(license) && (
                        <div className="row gap-4">
                            <div className="row gap-1.5">
                                <div className="text-lg font-semibold text-slate-400">$R1</div>
                                <div className="text-lg font-semibold text-primary">{license.rewards}</div>
                            </div>

                            <Button className="h-9" color="primary" size="sm" variant="solid">
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
                            disabledKeys={['title']}
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

                            {!isLicenseAssigned(license) ? (
                                <DropdownItem key="link">
                                    <div className="row gap-2">
                                        <RiLink className="pr-0.5 text-[22px] text-slate-500" />

                                        <div className="flex flex-col">
                                            <div className="font-medium text-body">Assign</div>
                                            <div className="text-xs text-slate-500">Link license to a node</div>
                                        </div>
                                    </div>
                                </DropdownItem>
                            ) : (
                                <DropdownItem key="link">
                                    <div className="row gap-2">
                                        <RiLinkUnlink className="pr-0.5 text-[22px] text-slate-500" />

                                        <div className="flex flex-col">
                                            <div className="font-medium text-body">Unassign</div>
                                            <div className="text-xs text-slate-500">Remove license from node</div>
                                        </div>
                                    </div>
                                </DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            )}
        </div>
    );
};
