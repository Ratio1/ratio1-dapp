import Logo from '@assets/token.svg';
import { Button } from '@nextui-org/button';
import { Timer } from '@shared/Timer';
import { add } from 'date-fns';
import { useState } from 'react';
import { RiTimeLine } from 'react-icons/ri';

{
    /* <div>Earned: $R1 1000</div>
<div>Available: $R1 46.2</div>
<div>Future claimable: $R1 99.5k (~$255.3K)</div> */
}

function LicensesDashboard() {
    const [timestamp, setTimestamp] = useState<Date>(add(new Date(), { hours: 14, minutes: 30 }));

    return (
        <div className="flex gap-6">
            <div className="relative mb-1 w-full rounded-3xl">
                <div className="col relative z-10 h-full gap-4 rounded-3xl bg-[#3f67bf] px-6 py-5">
                    <div className="flex justify-between gap-20 border-b-2 border-white/15 pb-4">
                        <div className="row gap-2">
                            <img src={Logo} alt="Logo" className="brightness-1000 h-7 filter" />
                            <div className="font-medium text-white">Rewards Summary</div>
                        </div>

                        <Button className="h-9" color="primary" size="sm" variant="faded">
                            <div className="text-sm">Claim all</div>
                        </Button>
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
