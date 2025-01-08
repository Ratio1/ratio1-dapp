import Bear from '@assets/bear.jpeg';
import Arbitrum from '@assets/networks/arbitrum.png';
import ArbitrumSepolia from '@assets/networks/arbitrum_sepolia.png';
import Ethereum from '@assets/networks/ethereum.png';
import EthereumSepolia from '@assets/networks/ethereum_sepolia.png';
import { useDisclosure } from '@lib/useDisclosure';
import { getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter } from '@nextui-org/drawer';
import { useState } from 'react';
import { RiArrowDownLine, RiArrowRightDoubleLine, RiSettingsLine } from 'react-icons/ri';

const networks = [
    {
        key: 1,
        label: 'Arbitrum',
        src: Arbitrum,
    },
    {
        key: 2,
        label: 'Arbitrum Sepolia',
        src: ArbitrumSepolia,
    },
    {
        key: 3,
        label: 'Ethereum Sepolia',
        src: EthereumSepolia,
    },
];

function Wallet() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [networkKeys, setNetworkKeys] = useState(new Set(['1']));

    return (
        <>
            <div className="flex items-center gap-3">
                <appkit-network-button />
                <appkit-button />
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
                    <DrawerBody className="my-4 flex flex-col gap-8">
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

                        <div className="flex flex-col gap-3">
                            <div className="text-2xl font-bold">Tokens</div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={Ethereum} alt="Ethereum" className="h-11 w-11 rounded-full" />

                                    <div className="flex flex-col gap-1">
                                        <div className="font-medium leading-4 text-black">Ethereum</div>
                                        <div className="text-sm font-medium leading-4 text-slate-500">0.027 ETH</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="font-medium leading-4 text-black">$92.74</div>

                                    <div className="flex items-center gap-0.5">
                                        <div className="text-red-500">
                                            <RiArrowDownLine />
                                        </div>

                                        <div className="text-sm font-medium leading-4 text-slate-500">4.06%</div>
                                    </div>
                                </div>
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
