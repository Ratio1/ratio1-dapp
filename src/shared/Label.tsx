interface Props {
    text: string;
    variant?: 'green' | 'red';
}

export const Label = ({ text, variant = 'red' }: Props) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-700',
        red: 'bg-red-100 text-red-700',
    };

    return (
        <div className={`${colorClasses[variant]} rounded-md px-2 py-1 text-xs font-medium tracking-wider larger:text-sm`}>
            {text}
        </div>
    );
};
