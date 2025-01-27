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
        <div className="row justify-between gap-3 min-[410px]:justify-start">
            <div className="min-w-[50%] text-slate-500">{label}</div>
            <div
                className={clsx({
                    'font-medium text-primary': isHighlighted,
                })}
            >
                {value}
            </div>
        </div>
    );

    const getNodePerformanceItem = (label: string, value: number, classes: string) => (
        <div className="row gap-2 sm:gap-3">
            <div className={`rounded-full p-1.5 sm:p-3.5 ${classes}`}>
                <RiTimeLine className="text-2xl" />
            </div>

            <div className="col gap-1 xl:gap-0">
                <div className="text-sm leading-4 text-slate-500 xl:text-base">{label}</div>
                <div className="text-sm font-medium xl:text-base">{value}h</div>
            </div>
        </div>
    );

    return (
        <div className="px-5 py-5 md:px-8 md:py-7">
            <div className="col gap-6 lg:gap-8">
                <div className="flex flex-col justify-between gap-3 border-b-2 border-slate-200 pb-6 text-sm lg:pb-8 lg:text-base xl:flex-row xl:gap-0">
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

                            {getLine('Total amount ($R1)', 46.38, true)}
                        </div>

                        <div className="col gap-3">
                            {getTitle('Summary')}

                            {summary.map(({ label, value }) => getLine(label, value))}
                        </div>
                    </div>
                </div>

                <div className="col -mt-0.5 gap-3">
                    {getTitle('Node performance')}

                    <div className="row gap-4 sm:gap-8">
                        <div className="text-sm text-slate-500 sm:text-base">Uptime per epoch</div>

                        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                            {nodePerformance.map(({ label, value, classes }) => getNodePerformanceItem(label, value, classes))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
