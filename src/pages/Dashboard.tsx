import Tiers from '@components/Tiers';
import { Button } from '@nextui-org/button';
import { RiArrowRightUpLine } from 'react-icons/ri';

function Dashboard() {
    return (
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

                    <Button color="primary">
                        <div className="text-base font-medium">Buy License</div>
                    </Button>
                </div>

                <div className="shadow-light-200/30 flex flex-col gap-4 rounded-2xl border border-[#e3e4e8] bg-light p-[1.75rem] shadow-sm-light">
                    <Tiers />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
