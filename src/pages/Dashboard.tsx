import Tiers from '@components/Tiers';
import { useDisclosure } from '@lib/useDisclosure';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Drawer, DrawerBody, DrawerContent } from '@nextui-org/drawer';
import { Input } from '@nextui-org/input';
import { BiMinus } from 'react-icons/bi';
import { RiAddFill, RiArrowRightDoubleLine, RiArrowRightUpLine, RiStickyNoteAddLine } from 'react-icons/ri';

function Dashboard() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <div className="flex w-full flex-col gap-6">
                <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col gap-6 rounded-3xl bg-softGray px-10 py-10">
                        <div className="flex flex-col gap-3">
                            <div className="text-xl font-bold leading-6">Claimable Rewards</div>

                            <div className="flex items-center justify-between">
                                <div className="text-[22px] font-semibold leading-6 text-primary">$92,239.00</div>

                                <div className="rounded-md bg-green-100 px-1.5 py-1 text-[15px] font-medium tracking-wider text-green-700">
                                    <div className="flex items-center gap-1">
                                        <div className="text-[18px]">
                                            <RiArrowRightUpLine />
                                        </div>
                                        <div>2.15%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 rounded-3xl bg-softGray px-10 py-10">
                        <div className="flex flex-col gap-3">
                            <div className="text-xl font-bold leading-6">RATIO1 Balance</div>

                            <div className="flex items-center justify-between">
                                <div className="text-[22px] font-semibold leading-6 text-primary">255.125</div>

                                <div className="rounded-md bg-green-100 px-1.5 py-1 text-[15px] font-medium tracking-wider text-green-700">
                                    <div className="flex items-center gap-1">
                                        <div className="text-[18px]">
                                            <RiArrowRightUpLine />
                                        </div>
                                        <div>7.25%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 rounded-3xl bg-softGray px-10 py-10">
                        <div className="flex flex-col gap-3">
                            <div className="text-xl font-semibold leading-6">Current Epoch</div>
                            <div className="text-[22px] font-semibold leading-6 text-slate-600">926</div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-6 rounded-3xl bg-softGray px-10 py-10">
                    <div className="flex items-center justify-between">
                        <div className="text-[26px] font-bold leading-7">Licenses & Tiers</div>

                        {/* <Button color="primary" startContent={<RiStickyNoteAddLine className="text-xl" />}>
                        <div className="text-base font-medium">Buy License</div>
                    </Button> */}

                        <Button color="primary" onPress={onOpen}>
                            <div className="flex items-center gap-3">
                                <div className="text-base font-medium">Buy License</div>
                                <RiArrowRightUpLine className="text-[18px]" />
                            </div>
                        </Button>
                    </div>

                    <div className="shadow-light-200/30 flex flex-col gap-4 rounded-2xl border border-[#e3e4e8] bg-light p-[1.75rem] shadow-sm-light">
                        <Tiers />
                    </div>
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
                    <DrawerBody className="my-4 flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <Button isIconOnly variant="flat" className="bg-lightAccent" onPress={onClose}>
                                <div className="text-[22px]">
                                    <RiArrowRightDoubleLine />
                                </div>
                            </Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-lightAccent">
                                <div className="flex items-center gap-2.5 p-4">
                                    <div className="rounded-md bg-primary p-2 text-white">
                                        <RiStickyNoteAddLine className="text-xl" />
                                    </div>

                                    <div className="text-base font-medium">Node License</div>
                                </div>

                                <div className="flex border-t border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between gap-12">
                                        <div className="font-medium">Quantity</div>

                                        <div className="flex gap-1">
                                            <Button
                                                className="min-w-10 rounded-lg border border-default-200 bg-[#fcfcfd] p-0"
                                                color="default"
                                                variant="bordered"
                                                size="md"
                                            >
                                                <BiMinus className="text-[18px] text-[#71717a]" />
                                            </Button>

                                            <Input
                                                size="md"
                                                classNames={{
                                                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                                                    input: 'font-medium',
                                                }}
                                                variant="bordered"
                                                color="primary"
                                                labelPlacement="outside"
                                                placeholder="1"
                                                type="number"
                                            />

                                            <Button
                                                className="min-w-10 rounded-lg border border-default-200 bg-[#fcfcfd] p-0"
                                                color="default"
                                                variant="bordered"
                                                size="md"
                                            >
                                                <RiAddFill className="text-[18px] text-[#71717a]" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-col rounded-md bg-lightAccent px-10 py-8">
                                <div className="flex flex-col gap-1.5 text-center">
                                    <div className="text-sm font-medium text-slate-500">Total amount</div>
                                    <div className="text-2xl font-semibold text-primary">$4500</div>
                                </div>

                                <Divider className="my-6 bg-slate-200" />

                                <div className="flex flex-col gap-4">
                                    <div className="text-sm font-medium text-slate-500">Summary</div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium">3 x Licenses (Tier 2)</div>
                                            <div className="text-sm font-medium">$3000</div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium">2 x Licenses (Tier 3)</div>
                                            <div className="text-sm font-medium">$2500</div>
                                        </div>
                                    </div>
                                </div>

                                <Divider className="my-6 bg-slate-200" />

                                <div className="flex items-center justify-between">
                                    <div className="font-medium">Total</div>
                                    <div className="font-medium text-primary">$5500</div>
                                </div>

                                <div className="mt-6 w-full">
                                    <Button className="w-full" color="primary">
                                        Buy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default Dashboard;
