import { domains, environment } from '@lib/config';
import { Select, SelectItem } from '@nextui-org/select';
import { SharedSelection } from '@nextui-org/system';
import clsx from 'clsx';
import { useState } from 'react';
import { RiGlobalLine } from 'react-icons/ri';

const networks = ['mainnet', 'testnet', 'devnet'];

export const NetworkSelector = () => {
    const [keys, setKeys] = useState(new Set<'mainnet' | 'testnet' | 'devnet'>([environment]));

    return (
        <Select
            className={clsx({
                'w-[128px]': keys.has('mainnet'),
                'w-[118px]': keys.has('testnet'),
                'w-[116px]': keys.has('devnet'),
            })}
            classNames={{
                base: 'w-auto',
                trigger: 'min-h-10 bg-slate-200 data-[hover=true]:bg-[#e0e3f0] rounded-lg',
                label: 'group-data-[filled=true]:-translate-y-5',
                value: 'font-medium !text-slate-600 lowercase',
                selectorIcon: 'mt-0.5 mr-0.5',
            }}
            items={networks.map((network) => ({ key: network }))}
            selectedKeys={keys}
            onSelectionChange={(value: SharedSelection) => {
                const network = value.anchorKey as 'mainnet' | 'testnet';

                if (network) {
                    setKeys(new Set([network]));
                    window.location.href = `https://${domains[network]}`;
                }
            }}
            aria-label="network-selector"
            label=""
            labelPlacement="outside"
            listboxProps={{
                itemClasses: {
                    base: [
                        'rounded-xl',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-default-100',
                        'data-[selectable=true]:focus:bg-default-100',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                        'px-3',
                    ],
                },
            }}
            popoverProps={{
                classNames: {
                    base: 'before:bg-default-200',
                    content: 'p-0 border-small border-divider bg-background',
                },
            }}
            variant="flat"
            startContent={<RiGlobalLine className="text-2xl text-slate-600" />}
        >
            {(network) => (
                <SelectItem key={network.key} textValue={`${network.key.charAt(0).toUpperCase() + network.key.slice(1)}`}>
                    <div className="row gap-2 py-1">
                        <div className="font-medium">{network.key}</div>
                    </div>
                </SelectItem>
            )}
        </Select>
    );
};
