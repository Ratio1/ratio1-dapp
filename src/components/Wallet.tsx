import Bear from '@assets/bear.jpeg';
import Arbitrum from '@assets/networks/arbitrum.png';
import ArbitrumSepolia from '@assets/networks/arbitrum_sepolia.png';
import EthereumSepolia from '@assets/networks/ethereum_sepolia.png';
import { useDisclosure } from '@lib/useDisclosure';
import { getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter } from '@nextui-org/drawer';
import { Select, SelectItem } from '@nextui-org/select';
import { RiArrowDownLine, RiArrowRightDoubleLine, RiSettingsLine, RiWallet3Line } from 'react-icons/ri';

const networks = [
    {
        id: 1,
        name: 'Arbitrum',
        src: Arbitrum,
    },
    {
        id: 2,
        name: 'Arbitrum Sepolia',
        src: ArbitrumSepolia,
    },
    {
        id: 3,
        name: 'Ethereum Sepolia',
        src: EthereumSepolia,
    },
];

function Wallet() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <div className="flex items-center gap-3">
                <Select
                    className="min-w-52"
                    classNames={{
                        trigger: 'min-h-12 bg-softGray data-[hover=true]:bg-gray-200',
                        label: 'group-data-[filled=true]:-translate-y-5',
                        listboxWrapper: 'max-h-[400px]',
                    }}
                    items={networks}
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
                    renderValue={(networks) => {
                        return networks.map((network) => (
                            <div key={network.key} className="flex items-center gap-2">
                                <div className="center-all h-7 w-7">
                                    <img alt={network.data?.name} className="h-6 rounded-full" src={network.data?.src} />
                                </div>

                                <div className="font-medium">{network.data?.name}</div>
                            </div>
                        ));
                    }}
                    variant="flat"
                >
                    {(network) => (
                        <SelectItem key={network.id} textValue={network.name}>
                            <div className="flex items-center gap-2 py-1">
                                <div className="center-all h-7 w-7">
                                    <img alt={network.name} className="h-6 rounded-full" src={network.src} />
                                </div>

                                <div className="font-medium">{network.name}</div>
                            </div>
                        </SelectItem>
                    )}
                </Select>

                <div className="flex">
                    <Button className="h-12" variant="solid" color="primary" onPress={onOpen}>
                        <div className="flex items-center gap-2">
                            <div className="text-[22px]">
                                <RiWallet3Line />
                            </div>

                            <div className="text-base font-medium">0.2675 ETH</div>
                            {/* <div className="text-base font-medium">Login</div> */}
                        </div>
                    </Button>
                </div>
            </div>

            <Drawer
                isOpen={isOpen}
                onOpenChange={onClose}
                size="sm"
                classNames={{
                    base: 'data-[placement=right]:sm:m-3 data-[placement=left]:sm:m-3 rounded-medium font-mona',
                }}
                motionProps={{
                    variants: {
                        enter: {
                            opacity: 1,
                            x: 0,
                        },
                        exit: {
                            x: 100,
                            opacity: 0,
                        },
                    },
                }}
                hideCloseButton
            >
                <DrawerContent>
                    <DrawerBody className="my-4 flex flex-col gap-7">
                        {/* Identity */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={Bear} alt="Bear" className="h-11 w-11 rounded-full" />

                                <div className="flex flex-col gap-1">
                                    <div className="font-medium leading-4 text-black">wzrdx.eth</div>
                                    <div className="text-sm font-medium leading-4 text-slate-500">
                                        {getShortAddress('0x58fFB0F89e50DcC25Bc208757a63dDA06d30433A')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button isIconOnly variant="flat">
                                    <div className="text-[22px]">
                                        <RiSettingsLine />
                                    </div>
                                </Button>

                                <Button isIconOnly variant="flat" onPress={onClose}>
                                    <div className="text-[22px]">
                                        <RiArrowRightDoubleLine />
                                    </div>
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="text-3xl font-bold">$114.75</div>

                            <div className="flex items-center gap-0.5">
                                <div className="text-red-500">
                                    <RiArrowDownLine />
                                </div>

                                <div className="font-medium text-slate-500">$0.30 (0.26%)</div>
                            </div>
                        </div>
                    </DrawerBody>

                    <DrawerFooter className="center-all cursor-pointer bg-pink-50 transition-all hover:bg-pink-100">
                        <div className="text-pink-600">Disconnect</div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default Wallet;
