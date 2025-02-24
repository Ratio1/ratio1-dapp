interface Props {
    label: string;
    value: number | string;
    symbol: string;
    isAproximate?: boolean;
}

export const TokenValueWithLabel = ({ label, value, symbol, isAproximate }: Props) => {
    return (
        <div className="col gap-1 text-center">
            <div className="text-sm font-medium text-slate-400 lg:text-base">{label}</div>

            <div className="center-all gap-1.5 text-[22px] font-semibold">
                <div className="text-slate-400">{`${isAproximate ? '~' : ''}$${symbol}`}</div>
                <div className="text-primary">{value}</div>
            </div>
        </div>
    );
};
