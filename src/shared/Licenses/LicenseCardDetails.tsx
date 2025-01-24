import clsx from 'clsx';
import { RiTimeLine } from 'react-icons/ri';

const nodeDetails = [
    {
        label: 'Assign timestamp',
        value: new Date().toLocaleString(),
    },
    {
        label: 'Last claimed epoch',
        value: 920,
    },
    {
        label: 'Claimable epochs',
        value: 6,
        isHighlighted: true,
    },
];

const proofOfAvailability = [
    {
        label: 'Initial amount',
        value: 100000,
    },
    {
        label: 'Remaining amount',
        value: 97600,
    },
];

const summary = [
    {
        label: 'Proof of Availability',
        value: 46.38,
    },
    {
        label: 'Proof of AI',
        value: 'N/A',
    },
];

const nodePerformance = [
    {
        label: 'Last Epoch',
        value: 16.2,
        classes: 'bg-teal-100 text-teal-600',
    },
    {
        label: 'All time average',
        value: 14.1,
        classes: 'bg-purple-100 text-purple-600',
    },
    {
        label: 'Last week average',
        value: 15.7,
        classes: 'bg-orange-100 text-orange-600',
    },
];

export const LicenseCardDetails = () => {
    const getTitle = (text: string) => <div className="text-base font-medium lg:text-lg">{text}</div>;

    const getLine = (label: string, value: string | number, isHighlighted: boolean = false) => (
        <div className="row gap-3">
            <div className="min-w-[158px] text-slate-500 lg:min-w-[184px]">{label}</div>
            <div
                className={clsx({
                    'font-medium text-primary': isHighlighted,
                })}
            >
                {value}
            </div>
        </div>
    );

    const getPerformanceBox = (label: string, value: number, classes: string) => (
        <div className="col gap-2">
            <div className="row gap-2.5">
                <div className={`rounded-full p-1.5 ${classes}`}>
                    <RiTimeLine className="text-2xl" />
                </div>

                <div className="text-sm font-medium text-slate-500">{label}</div>
            </div>

            <div className="text-lg font-medium lg:text-center lg:text-xl">{value}h</div>
        </div>
    );

    return (
        <div className="px-5 py-5 lg:px-8 lg:py-7">
            <div className="col gap-6 lg:gap-8">
                <div className="flex flex-col justify-between gap-3 border-b-2 border-slate-200 pb-6 text-sm lg:flex-row lg:gap-0 lg:pb-8 lg:text-base">
                    <div className="col flex-1 gap-6">
                        <div className="col gap-3">
                            {getTitle('Node details')}

                            {nodeDetails.map(({ label, value, isHighlighted }) => getLine(label, value, isHighlighted))}
                        </div>

                        <div className="col gap-3">
                            {getTitle('Proof of Availability')}

                            {proofOfAvailability.map(({ label, value }) => getLine(label, value))}
                        </div>
                    </div>

                    <div className="col flex-1 gap-6">
                        <div className="col gap-3">
                            {getTitle('Rewards')}

                            {getLine('Total amount ($R1)', 46.38)}
                        </div>

                        <div className="col gap-3">
                            {getTitle('Summary')}

                            {summary.map(({ label, value }) => getLine(label, value))}
                        </div>
                    </div>
                </div>

                <div className="col -mt-0.5 gap-3">
                    {getTitle('Node performance')}

                    <div className="col gap-3">
                        <div className="text-slate-500">Uptime per epoch</div>

                        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                            {nodePerformance.map(({ label, value, classes }) => getPerformanceBox(label, value, classes))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
