import { Skeleton } from '@nextui-org/skeleton';

export const LicenseSkeleton = () => {
    return (
        <Skeleton className="mx-auto min-h-[92px] max-w-2xl overflow-hidden rounded-3xl xl:max-w-none">
            <div className="border-lightBlue bg-lightBlue border-3"></div>
        </Skeleton>
    );
};
