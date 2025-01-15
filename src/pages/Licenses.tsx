import Logo from '@assets/token.svg';
import LicensesDashboard from '@components/LicensesDashboard';
import { fN, getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import { Tab, Tabs } from '@nextui-org/tabs';
import clsx from 'clsx';
import { round } from 'lodash';
import { useState } from 'react';
import { RiCpuLine, RiLink, RiLinkUnlink, RiMoreFill, RiTimeLine, RiWalletLine } from 'react-icons/ri';

const LICENSE_CAP = 25000;

const array = [
    {
        id: 1251,
        used: 4670,
    },
    {
        id: 385,
        alias: 'stefan-edge-node',
        node_address: '0xbF57FEB86044aE9f7B6ED74874A6b1d60D64601b',
        rewards: 256.1,
        used: 2500,
    },
    {
        id: 5564,
        alias: 'naeural_396c2f29',
        node_address: '0x71c4255E9ACa4E1Eb41167056F2f9dCC6DbBB58a',
        rewards: 112,
        used: 5800,
    },
    {
        id: 6713,
        alias: 'naeural_b859867c',
        node_address: '0x13FF7fDe859f980988Ce687C8797dBB82F031e42',
        rewards: 205,
        used: 575,
    },
    {
        id: 682,
        alias: 'aidmob-wsl',
        node_address: '0x795Fdb7cF8bFD17625998e7Ec7b3276ED79aEE25',
        rewards: 46.38,
        used: 17802,
    },
    {
        id: 5839,
        alias: 'bleo_core',
        node_address: '0x4D599d9584794E27A16e34bEA28750f5eA804Ad6',
        rewards: 8.52,
        used: 8102,
    },
];

function Licenses() {
    const [isExpanded, setExpanded] = useState<boolean>(true);

    return (
        <div className="flex flex-col gap-6">
            <LicensesDashboard />

            <Tabs
                aria-label="Tabs"
                color="primary"
                radius="lg"
                size="lg"
                classNames={{
                    tabList: 'p-1.5 bg-lightAccent',
                    tabContent: 'text-[15px]',
                }}
            >
                <Tab key="all" title="All" />
                <Tab
                    key="assigned"
                    title={
                        <div className="row gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            Assigned
                        </div>
                    }
                />
                <Tab
                    key="unassigned"
                    title={
                        <div className="row gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            Unassigned
                        </div>
                    }
                />
            </Tabs>

            {array.slice(4, 5).map((item) => (
                <div
                    key={item.id}
                    className="flex cursor-pointer flex-col overflow-hidden rounded-3xl border-3 border-lightAccent bg-lightAccent transition-all hover:border-[#e9ebf1]"
                    onClick={() => {
                        setExpanded(!isExpanded);
                    }}
                >
                    <div
                        className={clsx('row justify-between bg-white px-8 py-7', {
                            'rounded-bl-3xl rounded-br-3xl': isExpanded,
                        })}
                    >
                        <div className="row">
                            <div className="row min-w-[550px] gap-3">
                                {!!item.alias && <div className="min-w-[166px] font-medium">{item.alias}</div>}

                                <div className="flex min-w-[150px]">
                                    <div
                                        className={clsx('rounded-full px-3 py-2 text-sm font-medium', {
                                            'bg-[#e0eeff] text-primary': !!item.node_address,
                                            'bg-purple-100 text-purple-600': !item.node_address,
                                        })}
                                    >
                                        <div className="row gap-1">
                                            <RiCpuLine className="text-base" />
                                            <div>License #{item.id}</div>
                                        </div>
                                    </div>
                                </div>

                                {!!item.node_address && (
                                    <div className="rounded-full bg-orange-100 px-3 py-2 text-sm font-medium text-orange-600">
                                        <div className="row gap-1">
                                            <RiWalletLine className="text-base" />
                                            <div>{getShortAddress(item.node_address)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="row justify-between text-sm font-medium leading-none">
                                    <div>
                                        {fN(item.used)}/{fN(LICENSE_CAP)}
                                    </div>

                                    <div>{round((item.used * 100) / LICENSE_CAP, 1)}%</div>
                                </div>

                                <div className="flex h-1 w-40 overflow-hidden rounded-full bg-gray-300">
                                    <div
                                        className="rounded-full bg-primary transition-all"
                                        style={{ width: `${(item.used * 100) / LICENSE_CAP}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="row gap-4">
                            {!!item.node_address && (
                                <div className="row gap-4">
                                    <div className="row gap-1.5">
                                        <div className="text-lg font-semibold text-slate-400">$R1</div>
                                        <div className="text-lg font-semibold text-primary">{item.rewards}</div>
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

                                    {!item.node_address ? (
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
                    </div>

                    {isExpanded && (
                        <div className="px-8 py-8">
                            <div className="col gap-8">
                                <div className="flex justify-between border-b-2 border-slate-200 pb-8">
                                    <div className="col flex-1 gap-3">
                                        <div className="row gap-3">
                                            <div className="min-w-[166px] text-slate-500">Assign timestamp</div>
                                            <div className="">{new Date().toLocaleString()}</div>
                                        </div>

                                        <div className="row gap-3">
                                            <div className="min-w-[166px] text-slate-500">Last claimed epoch</div>
                                            <div className="">901</div>
                                        </div>

                                        <div className="row gap-3">
                                            <div className="min-w-[166px] text-slate-500">Claimable epochs</div>
                                            <div className="font-medium text-primary">902-926</div>
                                        </div>
                                    </div>

                                    <div className="relative max-w-[42%] flex-1 rounded-3xl">
                                        <div className="col relative z-10 gap-4 rounded-3xl bg-[#3f67bf] px-6 py-5">
                                            <div className="flex justify-between gap-20 border-b-2 border-white/15 pb-4">
                                                <div className="row gap-2.5">
                                                    <img src={Logo} alt="Logo" className="brightness-1000 h-7 filter" />
                                                    <div className="font-medium text-white">Rewards</div>
                                                </div>

                                                <Button className="h-9" color="primary" size="sm" variant="faded">
                                                    <div className="text-sm">Claim</div>
                                                </Button>
                                            </div>

                                            <div className="flex">
                                                <div className="flex-2">
                                                    <div className="col gap-2 text-white">
                                                        <div className="row justify-between">
                                                            <div className="text-sm text-white/85">Proof of Availability</div>
                                                            <div className="w-[42%] text-sm font-medium text-white">46.38</div>
                                                        </div>

                                                        <div className="row justify-between">
                                                            <div className="text-sm text-white/85">Proof of AI</div>
                                                            <div className="w-[42%] text-sm font-medium">0</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-1 flex-col text-right">
                                                    <div className="text-sm font-medium text-white/85">Total amount</div>
                                                    <div className="text-2xl font-semibold text-white">46.38</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute -bottom-1 left-0 right-0 h-20 rounded-3xl bg-[#658bdc]"></div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="row h-10 min-w-[166px]">
                                        <div className="text-slate-500">Uptime per epoch</div>
                                    </div>

                                    <div className="flex gap-10">
                                        <div className="col gap-2.5 border-l-2 border-slate-200 pl-10">
                                            <div className="flex items-center gap-2.5">
                                                <div className="rounded-full bg-teal-100 p-1.5 text-teal-600">
                                                    <RiTimeLine className="text-2xl" />
                                                </div>

                                                <div className="text-sm font-medium text-slate-500">Last Epoch</div>
                                            </div>

                                            <div className="text-center text-xl font-medium">16.2h</div>
                                        </div>

                                        <div className="col gap-2.5 border-l-2 border-slate-200 pl-10">
                                            <div className="flex items-center gap-2.5">
                                                <div className="rounded-full bg-purple-100 p-1.5 text-purple-600">
                                                    <RiTimeLine className="text-2xl" />
                                                </div>

                                                <div className="text-sm font-medium text-slate-500">All time average</div>
                                            </div>

                                            <div className="text-center text-xl font-medium">14.1h</div>
                                        </div>

                                        <div className="col gap-2.5 border-l-2 border-slate-200 pl-10">
                                            <div className="flex items-center gap-2.5">
                                                <div className="rounded-full bg-orange-100 p-1.5 text-orange-600">
                                                    <RiTimeLine className="text-2xl" />
                                                </div>

                                                <div className="text-sm font-medium text-slate-500">Last week average</div>
                                            </div>

                                            <div className="text-center text-xl font-medium">15.7h</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {array.slice(0, 1).map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-3xl bg-lightAccent px-8 py-7">
                    <div className="row justify-between">
                        <div className="row">
                            <div className="row min-w-[550px] gap-3">
                                {!!item.alias && <div className="min-w-[166px] font-medium">{item.alias}</div>}

                                <div className="flex min-w-[150px]">
                                    <div
                                        className={clsx('rounded-full px-3 py-2 text-sm font-medium', {
                                            'bg-[#e0eeff] text-primary': !!item.node_address,
                                            'bg-purple-100 text-purple-600': !item.node_address,
                                        })}
                                    >
                                        <div className="row gap-1">
                                            <RiCpuLine className="text-base" />
                                            <div>License #{item.id}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-600">
                                    <div className="row gap-1">
                                        <RiTimeLine className="text-base" />
                                        <div>Assignable after {new Date().toLocaleString()}</div>
                                    </div>
                                </div>

                                {!!item.node_address && (
                                    <div className="rounded-full bg-orange-100 px-3 py-2 text-sm font-medium text-orange-600">
                                        <div className="row gap-1">
                                            <RiWalletLine className="text-base" />
                                            <div>{getShortAddress(item.node_address)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="row justify-between text-sm font-medium leading-none">
                                    <div>
                                        {fN(item.used)}/{fN(LICENSE_CAP)}
                                    </div>

                                    <div>{round((item.used * 100) / LICENSE_CAP, 1)}%</div>
                                </div>

                                <div className="flex h-1 w-40 overflow-hidden rounded-full bg-gray-300">
                                    <div
                                        className="rounded-full bg-primary transition-all"
                                        style={{ width: `${(item.used * 100) / LICENSE_CAP}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="row gap-4">
                            {!!item.node_address && (
                                <div className="row gap-4">
                                    <div className="row gap-1.5">
                                        <div className="text-lg font-semibold text-slate-400">$R1</div>
                                        <div className="text-lg font-semibold text-primary">{item.rewards}</div>
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

                                    {!item.node_address ? (
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
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Licenses;
