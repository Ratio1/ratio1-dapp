import { getShortAddressOrHash } from '@lib/utils';
import clsx from 'clsx';
import { useState } from 'react';
import { RiCheckLine, RiFileCopyLine } from 'react-icons/ri';

interface Props {
    value: string;
    size?: number;
    isLarge?: boolean;
    isLight?: boolean;
}

export const CopyableValue = ({ value, size = 4, isLarge = false, isLight = false }: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    };

    const getAddress = () => (
        <div
            className={clsx({
                'text-sm': !isLarge,
                'text-[15px]': isLarge,
                'text-slate-500': !isLight,
                'text-slate-400': isLight,
            })}
        >
            {size >= value.length ? value : getShortAddressOrHash(value, size)}
        </div>
    );

    return (
        <div className="row gap-1">
            {getAddress()}

            <div className="text-primary-300">
                {!copied ? (
                    <RiFileCopyLine
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleCopy();
                        }}
                        className="cursor-pointer hover:opacity-70"
                    />
                ) : (
                    <RiCheckLine />
                )}
            </div>
        </div>
    );
};
