interface Props {
    label: string;
    value: number | string;
    isAproximate?: boolean;
}

export const R1ValueWithLabel = ({ label, value, isAproximate }: Props) => {
    return (
        <div className="col gap-0.5 text-center">
            <div className="text-sm font-medium text-slate-400 lg:text-base">{label}</div>

            <div className="center-all gap-1.5">
                <div className="text-[22px] font-semibold text-slate-400">{`${isAproximate ? '~' : ''}$R1`}</div>
                <div className="text-[22px] font-semibold text-primary">{value}</div>
            </div>
        </div>
    );
};
