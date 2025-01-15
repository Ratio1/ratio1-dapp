import Logo from '@assets/token.svg';
import { Button } from '@nextui-org/button';
import { Tab, Tabs } from '@nextui-org/tabs';
import { Timer } from '@shared/Timer';
import { add } from 'date-fns';
import { useState } from 'react';
import { RiTimeLine } from 'react-icons/ri';

function LicensesDashboard() {
    const [timestamp, setTimestamp] = useState<Date>(add(new Date(), { hours: 14, minutes: 30 }));

    return (
        <div className="flex gap-6">
            <div className="relative mb-1 w-full rounded-3xl">
                <div className="col relative z-10 h-full gap-4 rounded-3xl bg-[#3f67bf] px-6 py-5">
                    <div className="flex justify-between gap-20 border-b-2 border-white/15 pb-4">
                        <div className="row gap-2.5">
                            <img src={Logo} alt="Logo" className="brightness-1000 h-7 filter" />
                            <div className="text-lg font-medium text-white">Rewards</div>
                        </div>

                        <Button className="h-9" color="primary" size="sm" variant="faded">
                            <div className="text-sm">Claim all</div>
                        </Button>
                    </div>

                    <div className="col gap-8">
                        <div className="row justify-between">
                            <div className="col gap-1">
                                <div className="text-sm font-medium text-white/85">Claimable (R1)</div>
                                <div className="text-xl font-medium text-white">46.2</div>
                            </div>

                            <div className="col gap-1">
                                <div className="text-sm font-medium text-white/85">Earned (R1)</div>
                                <div className="text-xl font-medium text-white">1012.895</div>
                            </div>

                            <div className="col gap-1">
                                <div className="text-sm font-medium text-white/85">Future Claimable (R1)</div>
                                <div className="text-xl font-medium text-white">199.2k</div>
                            </div>

                            <div className="col gap-1">
                                <div className="text-sm font-medium text-white/85">Future Claimable ($)</div>
                                <div className="text-xl font-medium text-white">$862.825k</div>
                            </div>
                        </div>

                        <div className="col gap-2">
                            <div className="text-lg font-medium text-white">Licenses</div>
                            <Tabs
                                aria-label="Tabs"
                                color="primary"
                                radius="lg"
                                size="lg"
                                classNames={{
                                    tabList: 'p-1.5 bg-lightAccent',
                                    tabContent: 'text-[15px]',
                                }}
                            >
                                <Tab key="all" title="All" />
                                <Tab
                                    key="assigned"
                                    title={
                                        <div className="row gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            Assigned
                                        </div>
                                    }
                                />
                                <Tab
                                    key="unassigned"
                                    title={
                                        <div className="row gap-2">
                                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                            Unassigned
                                        </div>
                                    }
                                />
                            </Tabs>
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-1 left-0 right-0 h-20 rounded-3xl bg-[#658bdc]"></div>
            </div>

            <div className="flex flex-col gap-6 rounded-3xl bg-lightAccent px-10 py-10">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-full bg-primary-50 p-1.5 text-primary-600">
                            <RiTimeLine className="text-2xl" />
                        </div>

                        <div className="whitespace-nowrap text-xl font-semibold leading-6">Next Rewards Batch</div>
                    </div>

                    <Timer
                        timestamp={timestamp}
                        callback={() => {
                            console.log('Timer');
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default LicensesDashboard;
