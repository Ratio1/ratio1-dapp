import { RiTimeLine } from 'react-icons/ri';

export const LicenseCardDetails = () => {
    return (
        <div className="px-5 py-5 lg:px-8 lg:py-7">
            <div className="col gap-6 lg:gap-8">
                <div className="flex flex-col justify-between gap-3 border-b-2 border-slate-200 pb-6 text-sm lg:flex-row lg:gap-0 lg:pb-8 lg:text-base">
                    <div className="col flex-1 gap-3">
                        <div className="text-base font-medium lg:text-lg">Node information</div>

                        <div className="row gap-3">
                            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">Assign timestamp</div>
                            <div>{new Date().toLocaleString()}</div>
                        </div>

                        <div className="row gap-3">
                            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">Last claimed epoch</div>
                            <div>920</div>
                        </div>

                        <div className="row gap-3">
                            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">Claimable epochs</div>
                            <div className="font-medium text-primary">6</div>
                        </div>

                        <div className="pt-1 text-base font-medium lg:pt-2 lg:text-lg">Proof of Availability</div>

                        <div className="row gap-3">
                            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">Initial amount</div>
                            <div>100k</div>
                        </div>

                        <div className="row gap-3">
                            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">Remaining amount</div>
                            <div>97.6k</div>
                        </div>
                    </div>

                    <div className="col flex-1 gap-3">
                        <div className="pt-1 text-base font-medium lg:pt-0 lg:text-lg">Rewards</div>

                        <div className="row gap-3">
                            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">Total amount ($R1)</div>
                            <div className="font-medium text-primary">46.38</div>
                        </div>

                        <div className="pt-1 text-base font-medium lg:pt-2 lg:text-lg">Summary</div>

                        <div className="row gap-3">
                            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">Proof of Availability</div>
                            <div>46.38</div>
                        </div>

                        <div className="row gap-3">
                            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">Proof of AI</div>
                            <div>N/A</div>
                        </div>
                    </div>
                </div>

                <div className="col gap-3">
                    <div className="text-base font-medium leading-none lg:text-lg">Node performance</div>

                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="row h-8 min-w-[158px] lg:h-10 lg:min-w-[184px]">
                            <div className="text-slate-500">Uptime per epoch</div>
                        </div>

                        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                            <div className="col gap-1.5 lg:gap-2.5 lg:border-l-2 lg:border-slate-200 lg:pl-10">
                                <div className="row gap-2.5">
                                    <div className="rounded-full bg-teal-100 p-1.5 text-teal-600">
                                        <RiTimeLine className="text-2xl" />
                                    </div>

                                    <div className="text-sm font-medium text-slate-500">Last Epoch</div>
                                </div>

                                <div className="text-lg font-medium lg:text-center lg:text-xl">16.2h</div>
                            </div>

                            <div className="col gap-1.5 lg:gap-2.5 lg:border-l-2 lg:border-slate-200 lg:pl-10">
                                <div className="row gap-2.5">
                                    <div className="rounded-full bg-purple-100 p-1.5 text-purple-600">
                                        <RiTimeLine className="text-2xl" />
                                    </div>

                                    <div className="text-sm font-medium text-slate-500">All time average</div>
                                </div>

                                <div className="text-lg font-medium lg:text-center lg:text-xl">14.1h</div>
                            </div>

                            <div className="col gap-1.5 lg:gap-2.5 lg:border-l-2 lg:border-slate-200 lg:pl-10">
                                <div className="row gap-2.5">
                                    <div className="rounded-full bg-orange-100 p-1.5 text-orange-600">
                                        <RiTimeLine className="text-2xl" />
                                    </div>

                                    <div className="text-sm font-medium text-slate-500">Last week average</div>
                                </div>

                                <div className="text-lg font-medium lg:text-center lg:text-xl">15.7h</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
