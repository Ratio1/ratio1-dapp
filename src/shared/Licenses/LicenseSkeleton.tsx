import { Skeleton } from '@nextui-org/skeleton';

export const LicenseSkeleton = () => {
    return (
        <Skeleton className="mx-auto min-h-[92px] max-w-2xl overflow-hidden rounded-3xl xl:max-w-none">
            <div className="border-3 border-lightAccent bg-lightAccent"></div>
        </Skeleton>
    );
};
