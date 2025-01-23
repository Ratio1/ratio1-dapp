import Buy from '@components/Buy';
import Tiers from '@components/Tiers';
import { genesisDate } from '@lib/config';
import { useDisclosure } from '@lib/useDisclosure';
import { Button } from '@nextui-org/button';
import { Drawer, DrawerBody, DrawerContent } from '@nextui-org/drawer';
import { addDays, differenceInDays, formatDistanceToNow } from 'date-fns';
import { RiArrowRightUpLine, RiTimeLine } from 'react-icons/ri';

function Dashboard() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <div className="flex w-full flex-col gap-6">
                <div className="grid grid-cols-3 gap-6">
                    <div className="col gap-6 rounded-3xl bg-lightAccent px-10 py-10">
                        <div className="col gap-3">
                            <div className="text-xl font-semibold leading-6">Claimable $R1</div>

                            <div className="row gap-2.5">
                                <div className="text-[22px] font-semibold leading-6 text-primary">1287.45</div>
                            </div>
                        </div>
                    </div>

                    <div className="col gap-6 rounded-3xl bg-lightAccent px-10 py-10">
                        <div className="col gap-3">
                            <div className="text-xl font-semibold leading-6">$R1 Balance</div>

                            <div className="row gap-2.5">
                                <div className="text-[22px] font-semibold leading-6 text-primary">255.125</div>

                                <div className="rounded-md bg-[#cff9de] px-2 py-1 text-sm font-medium tracking-wider text-green-700">
                                    <div className="row gap-1">
                                        <div className="-ml-0.5 text-[18px]">
                                            <RiArrowRightUpLine />
                                        </div>
                                        <div>7.25%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col gap-6 rounded-3xl bg-lightAccent px-10 py-10">
                        <div className="col gap-3">
                            <div className="text-xl font-semibold leading-6">Current Epoch</div>

                            <div className="row gap-2.5">
                                <div className="text-[22px] font-semibold leading-6">
                                    {differenceInDays(new Date(), genesisDate)}
                                </div>

                                <div className="rounded-md bg-orange-100 px-2 py-1 text-sm font-medium tracking-wider text-orange-600">
                                    <div className="row gap-1">
                                        <div className="text-[18px]">
                                            <RiTimeLine />
                                        </div>
                                        <div>
                                            {formatDistanceToNow(
                                                addDays(genesisDate, 1 + differenceInDays(new Date(), genesisDate)),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-6 rounded-3xl bg-lightAccent px-10 py-10">
                    <div className="row justify-between">
                        <div className="text-[26px] font-bold leading-7">Licenses & Tiers</div>

                        <Button color="primary" onPress={onOpen}>
                            <div className="row gap-3">
                                <div className="text-base font-medium">Buy License</div>
                                <RiArrowRightUpLine className="text-[18px]" />
                            </div>
                        </Button>
                    </div>

                    <div className="col gap-4 rounded-2xl border border-[#e3e4e8] bg-light p-[1.75rem]">
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
                    <DrawerBody>
                        <Buy onClose={onClose} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default Dashboard;
