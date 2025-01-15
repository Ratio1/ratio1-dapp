import { Timer } from '@shared/Timer';
import { add } from 'date-fns';
import { useState } from 'react';
import { RiTimeLine } from 'react-icons/ri';

function LicensesDashboard() {
    const [timestamp, setTimestamp] = useState<Date>(add(new Date(), { hours: 14, minutes: 30 }));

    return (
        <div className="grid grid-cols-3 gap-6">
            <div className="col gap-4">
                <div className="col gap-2">
                    <div>Rewards</div>
                    <div>Earned: $R1 1000</div>
                    <div>Available: $R1 46.2</div>
                    <div>Future claimable: $R1 99.5k (~$255.3K)</div>
                </div>

                <div className="col gap-2">
                    <div>Claim all</div>
                </div>
            </div>

            <div className="flex flex-col gap-6 rounded-3xl bg-lightAccent px-10 py-10">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-full bg-primary-50 p-1.5 text-primary-600">
                            <RiTimeLine className="text-2xl" />
                        </div>

                        <div className="text-xl font-semibold leading-6">Next Rewards Batch</div>
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
