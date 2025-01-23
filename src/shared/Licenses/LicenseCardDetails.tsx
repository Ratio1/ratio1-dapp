import { RiTimeLine } from 'react-icons/ri';

export const LicenseCardDetails = () => {
    return (
        <div className="px-8 py-8">
            <div className="col gap-8">
                <div className="flex justify-between border-b-2 border-slate-200 pb-8">
                    <div className="col flex-1 gap-3">
                        <div className="text-lg font-medium">Node information</div>

                        <div className="row gap-3">
                            <div className="min-w-[184px] text-slate-500">Assign timestamp</div>
                            <div>{new Date().toLocaleString()}</div>
                        </div>

                        <div className="row gap-3">
                            <div className="min-w-[184px] text-slate-500">Last claimed epoch</div>
                            <div>920</div>
                        </div>

                        <div className="row gap-3">
                            <div className="min-w-[184px] text-slate-500">Claimable epochs</div>
                            <div className="font-medium text-primary">6</div>
                        </div>

                        <div className="pt-2 text-lg font-medium">Proof of Availability</div>

                        <div className="row gap-3">
                            <div className="min-w-[184px] text-slate-500">Initial amount</div>
                            <div>100k</div>
                        </div>

                        <div className="row gap-3">
                            <div className="min-w-[184px] text-slate-500">Remaining amount</div>
                            <div>97.6k</div>
                        </div>
                    </div>

                    <div className="col flex-1 gap-3">
                        <div className="text-lg font-medium">Rewards</div>

                        <div className="row gap-3">
                            <div className="min-w-[184px] text-slate-500">Total amount ($R1)</div>
                            <div className="font-medium text-primary">46.38</div>
                        </div>

                        <div className="pt-2 text-lg font-medium">Summary</div>

                        <div className="row gap-3">
                            <div className="min-w-[184px] text-slate-500">Proof of Availability</div>
                            <div>46.38</div>
                        </div>

                        <div className="row gap-3">
                            <div className="min-w-[184px] text-slate-500">Proof of AI</div>
                            <div>0</div>
                        </div>
                    </div>
                </div>

                <div className="col gap-3">
                    <div className="text-lg font-medium leading-none">Node performance</div>

                    <div className="flex gap-3">
                        <div className="row h-10 min-w-[184px]">
                            <div className="text-slate-500">Uptime per epoch</div>
                        </div>

                        <div className="flex gap-10">
                            <div className="col gap-2.5 border-l-2 border-slate-200 pl-10">
                                <div className="row gap-2.5">
                                    <div className="rounded-full bg-teal-100 p-1.5 text-teal-600">
                                        <RiTimeLine className="text-2xl" />
                                    </div>

                                    <div className="text-sm font-medium text-slate-500">Last Epoch</div>
                                </div>

                                <div className="text-center text-xl font-medium">16.2h</div>
                            </div>

                            <div className="col gap-2.5 border-l-2 border-slate-200 pl-10">
                                <div className="row gap-2.5">
                                    <div className="rounded-full bg-purple-100 p-1.5 text-purple-600">
                                        <RiTimeLine className="text-2xl" />
                                    </div>

                                    <div className="text-sm font-medium text-slate-500">All time average</div>
                                </div>

                                <div className="text-center text-xl font-medium">14.1h</div>
                            </div>

                            <div className="col gap-2.5 border-l-2 border-slate-200 pl-10">
                                <div className="row gap-2.5">
                                    <div className="rounded-full bg-orange-100 p-1.5 text-orange-600">
                                        <RiTimeLine className="text-2xl" />
                                    </div>

                                    <div className="text-sm font-medium text-slate-500">Last week average</div>
                                </div>

                                <div className="text-center text-xl font-medium">15.7h</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
