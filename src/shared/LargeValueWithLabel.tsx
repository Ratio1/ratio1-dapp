interface Props {
    label: string;
    value: string;
    isCompact?: boolean;
}

export const LargeValueWithLabel = ({ label, value, isCompact }: Props) => {
    return (
        <div className="col text-center lg:text-left">
            <div className={`${isCompact ? '' : 'lg:text-[20px]'} text-lg font-semibold`}>{label}</div>
            <div className={`${isCompact ? '' : 'lg:text-[22px]'} text-xl font-semibold text-primary`}>{value}</div>
        </div>
    );
};
