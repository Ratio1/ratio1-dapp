export const BorderedCard = ({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) => {
    return (
        <div className="w-full overflow-hidden rounded-2xl border-2 border-slate-100 bg-white">
            {children}

            {!!footer && <div className="border-t-2 border-slate-100">{footer}</div>}
        </div>
    );
};
