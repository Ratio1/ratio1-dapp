import { Button } from '@nextui-org/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@nextui-org/dropdown';
import { RiLink, RiMoreFill } from 'react-icons/ri';

const array = [
    {
        id: 385,
        alias: 'stefan-edge-node',
        eth_address: '0xbF57FEB86044aE9f7B6ED74874A6b1d60D64601b',
        isUnlinked: true,
    },
    {
        id: 5567,
        alias: 'naeural_396c2f29',
        eth_address: '0x71c4255E9ACa4E1Eb41167056F2f9dCC6DbBB58a',
    },
    {
        id: 6713,
        alias: 'naeural_b859867c',
        eth_address: '0x13FF7fDe859f980988Ce687C8797dBB82F031e42',
    },
    {
        id: 681,
        alias: 'aidmob-wsl',
        eth_address: '0x795Fdb7cF8bFD17625998e7Ec7b3276ED79aEE25',
    },
    {
        id: 5839,
        alias: 'bleo_core',
        eth_address: '0x4D599d9584794E27A16e34bEA28750f5eA804Ad6',
    },
];

function Licenses() {
    return (
        <div className="flex flex-col gap-6">
            {array.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-3xl bg-lightAccent px-8 py-7">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {item.isUnlinked ? (
                                <div className="rounded-full bg-red-100 px-4 py-2 font-medium text-red-600">
                                    License #{item.id}
                                </div>
                            ) : (
                                <div className="rounded-full bg-[#e0eeff] px-4 py-2 font-medium text-primary">
                                    License #{item.id}
                                </div>
                            )}
                        </div>

                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    className="min-w-10 rounded-lg border border-default-200 bg-[#fcfcfd] p-0"
                                    color="default"
                                    variant="bordered"
                                    size="md"
                                >
                                    <RiMoreFill className="text-[18px]" />
                                </Button>
                            </DropdownTrigger>

                            <DropdownMenu aria-label="Dropdown" variant="faded">
                                <DropdownSection showDivider title="Actions">
                                    <DropdownItem key="new" description="Link" startContent={<RiLink className="text-lg" />}>
                                        Links license to a node
                                    </DropdownItem>
                                </DropdownSection>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Licenses;
