import Buy from '@components/Buy';
import Tiers from '@components/Tiers';
import { genesisDate } from '@lib/config';
import { useDisclosure } from '@lib/useDisclosure';
import { Button } from '@nextui-org/button';
import { Drawer, DrawerBody, DrawerContent } from '@nextui-org/drawer';
import { BigCard } from '@shared/BigCard';
import { addDays, differenceInDays, formatDistanceToNow } from 'date-fns';
import { RiArrowRightUpLine, RiTimeLine } from 'react-icons/ri';

function Dashboard() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <div className="flex w-full flex-col gap-4 lg:gap-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                    <BigCard>
                        <div className="col h-full justify-between gap-3">
                            <div className="text-base font-semibold leading-6 lg:text-xl">Claimable $R1</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6 text-primary lg:text-[22px]">1287.45</div>
                            </div>
                        </div>
                    </BigCard>

                    <BigCard>
                        <div className="col h-full justify-between gap-3">
                            <div className="text-base font-semibold leading-6 lg:text-xl">$R1 Balance</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6 text-primary lg:text-[22px]">255.125</div>
                            </div>
                        </div>
                    </BigCard>

                    <BigCard>
                        <div className="col h-full justify-between gap-3">
                            <div className="text-base font-semibold leading-6 lg:text-xl">Current Epoch</div>

                            <div className="row gap-2.5">
                                <div className="text-xl font-semibold leading-6 lg:text-[22px]">
                                    {differenceInDays(new Date(), genesisDate)}
                                </div>

                                <div className="web-only rounded-md bg-orange-100 px-2 py-1 text-sm font-medium tracking-wider text-orange-600">
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
                    </BigCard>
                </div>

                <BigCard fullWidth>
                    <div className="row justify-between">
                        <div className="text-xl font-bold leading-7 lg:text-[26px]">Licenses & Tiers</div>

                        <Button color="primary" onPress={onOpen}>
                            <div className="row gap-1.5">
                                <div className="text-sm font-medium lg:text-base">Buy License</div>
                                <RiArrowRightUpLine className="text-[18px]" />
                            </div>
                        </Button>
                    </div>

                    <div className="col gap-4 rounded-2xl border border-[#e3e4e8] bg-light p-[1.75rem]">
                        <Tiers />
                    </div>
                </BigCard>
            </div>

            <Drawer
                isOpen={isOpen}
                onOpenChange={onClose}
                size="sm"
                classNames={{
                    base: 'data-[placement=right]:sm:m-3 data-[placement=left]:sm:m-3 rounded-none sm:rounded-medium font-mona',
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
