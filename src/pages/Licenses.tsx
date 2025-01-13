import { fN, getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import clsx from 'clsx';
import { round } from 'lodash';
import { RiCpuLine, RiLink, RiLinkUnlink, RiMoreFill, RiWalletLine } from 'react-icons/ri';

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
    return (
        <div className="flex flex-col gap-4">
            {array.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-3xl bg-lightAccent px-8 py-7">
                    <div className="row justify-between">
                        <div className="row">
                            <div className="row min-w-[550px] gap-3">
                                {!!item.alias && <div className="min-w-[160px] font-medium">{item.alias}</div>}

                                <div className="flex min-w-[150px]">
                                    <div
                                        className={clsx('rounded-full px-3 py-2 text-sm font-medium', {
                                            'bg-[#e0eeff] text-primary': !!item.node_address,
                                            'bg-red-100 text-red-600': !item.node_address,
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
                                                    <div className="font-medium text-body">Link</div>
                                                    <div className="text-xs text-slate-500">Assign license to a node</div>
                                                </div>
                                            </div>
                                        </DropdownItem>
                                    ) : (
                                        <DropdownItem key="link">
                                            <div className="row gap-2">
                                                <RiLinkUnlink className="pr-0.5 text-[22px] text-slate-500" />

                                                <div className="flex flex-col">
                                                    <div className="font-medium text-body">Unlink</div>
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

            {array.map((item) => (
                <div key={item.id} className="flex flex-col rounded-3xl bg-lightAccent">
                    <div className="row justify-between rounded-3xl border-3 border-lightAccent bg-white px-8 py-7">
                        <div className="row">
                            <div className="row min-w-[550px] gap-3">
                                {!!item.alias && <div className="min-w-[160px] font-medium">{item.alias}</div>}

                                <div className="flex min-w-[150px]">
                                    <div
                                        className={clsx('rounded-full px-3 py-2 text-sm font-medium', {
                                            'bg-[#e0eeff] text-primary': !!item.node_address,
                                            'bg-red-100 text-red-600': !item.node_address,
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
                                                    <div className="font-medium text-body">Link</div>
                                                    <div className="text-xs text-slate-500">Assign license to a node</div>
                                                </div>
                                            </div>
                                        </DropdownItem>
                                    ) : (
                                        <DropdownItem key="link">
                                            <div className="row gap-2">
                                                <RiLinkUnlink className="pr-0.5 text-[22px] text-slate-500" />

                                                <div className="flex flex-col">
                                                    <div className="font-medium text-body">Unlink</div>
                                                    <div className="text-xs text-slate-500">Remove license from node</div>
                                                </div>
                                            </div>
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>

                    {item.id % 2 === 0 && (
                        <div className="px-8 py-7">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et ex eget sem tincidunt vehicula.
                            Integer semper leo aliquam nisi interdum dignissim. Aenean ultricies ipsum ut urna pellentesque
                            interdum. Aliquam fermentum tincidunt massa at varius. Morbi condimentum tristique turpis ac
                            consectetur. In molestie lorem eu tristique dictum.
                        </div>
                    )}
                </div>
            ))}

            {array.slice(3, 4).map((item) => (
                <div key={item.id} className="flex flex-col rounded-3xl bg-lightAccent">
                    <div className="row justify-between rounded-3xl border-3 border-lightAccent bg-lightAccent px-8 py-7">
                        <div className="row">
                            <div className="row min-w-[550px] gap-3">
                                {!!item.alias && <div className="min-w-[160px] font-medium">{item.alias}</div>}

                                <div className="flex min-w-[150px]">
                                    <div
                                        className={clsx('rounded-full px-3 py-2 text-sm font-medium', {
                                            'bg-[#e0eeff] text-primary': !!item.node_address,
                                            'bg-red-100 text-red-600': !item.node_address,
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
                                                    <div className="font-medium text-body">Link</div>
                                                    <div className="text-xs text-slate-500">Assign license to a node</div>
                                                </div>
                                            </div>
                                        </DropdownItem>
                                    ) : (
                                        <DropdownItem key="link">
                                            <div className="row gap-2">
                                                <RiLinkUnlink className="pr-0.5 text-[22px] text-slate-500" />

                                                <div className="flex flex-col">
                                                    <div className="font-medium text-body">Unlink</div>
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
