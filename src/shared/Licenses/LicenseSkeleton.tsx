import { Skeleton } from '@nextui-org/skeleton';

export const LicenseSkeleton = () => {
    return (
        <Skeleton className="min-h-[112px] w-full overflow-hidden rounded-3xl">
            <div className="border-3 border-slate-100 bg-slate-100"></div>
        </Skeleton>
    );
};
