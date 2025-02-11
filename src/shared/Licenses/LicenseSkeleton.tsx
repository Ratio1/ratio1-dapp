import { Skeleton } from '@nextui-org/skeleton';

export const LicenseSkeleton = () => {
    return (
        <Skeleton className="mx-auto min-h-[112px] max-w-2xl overflow-hidden rounded-3xl xl:max-w-none">
            <div className="border-3 border-lightBlue bg-lightBlue"></div>
        </Skeleton>
    );
};
