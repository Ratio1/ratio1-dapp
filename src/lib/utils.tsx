import { ClosableToastContent } from '@shared/ClosableToastContent';
import { throttle } from 'lodash';
import toast from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';
import { PriceTier } from 'typedefs/blockchain';

export const getShortAddress = (address: string, size = 4, asString = false): string | JSX.Element => {
    const str = `${address.slice(0, size)}•••${address.slice(-size)}`;

    if (asString) {
        return str;
    }

    return <div className="font-robotoMono">{str}</div>;
};

export function fN(num: number): string | number {
    if (num >= 1_000_000) {
        const formattedNum = num / 1_000_000;
        return formattedNum % 1 === 0 ? `${formattedNum}M` : `${parseFloat(formattedNum.toFixed(2))}M`;
    }

    if (num >= 1000) {
        const formattedNum = num / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${parseFloat(formattedNum.toFixed(2))}K`;
    }

    return parseFloat(num.toFixed(2));
}

export function fBI(num: bigint, decimals: number): string {
    num = num / 10n ** BigInt(decimals);
    if (num >= 1_000_000n) {
        const formattedNum = Number(num) / 1_000_000;
        return formattedNum % 1 === 0 ? `${formattedNum}M` : `${parseFloat(formattedNum.toFixed(2))}M`;
    }
    if (num >= 1000n) {
        const formattedNum = Number(num) / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${parseFloat(formattedNum.toFixed(2))}K`;
    }
    return num.toString();
}

export const throttledToastError = throttle(
    (message: string) => {
        toast.error(message);
    },
    5000,
    { trailing: false },
);

export const throttledToastOracleError = throttle(
    () => {
        toast(
            (t) => (
                <ClosableToastContent toastId={t.id} variant="error" icon={<RiCodeSSlashLine className="text-red-600" />}>
                    <div className="text-sm">Oracle state is not valid, please contact the development team.</div>
                </ClosableToastContent>
            ),
            {
                duration: 10000,
                style: {
                    width: '364px',
                    maxWidth: '96vw',
                },
            },
        );
    },
    5000,
    { trailing: false },
);

export const arrayAverage = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const INITIAL_TIERS_STATE: PriceTier[] = [
    {
        index: 1,
        usdPrice: 500,
        totalUnits: 89,
        soldUnits: 89,
    },
    {
        index: 2,
        usdPrice: 750,
        totalUnits: 144,
        soldUnits: 0,
    },
    {
        index: 3,
        usdPrice: 1000,
        totalUnits: 233,
        soldUnits: 0,
    },
    {
        index: 4,
        usdPrice: 1500,
        totalUnits: 377,
        soldUnits: 0,
    },
    {
        index: 5,
        usdPrice: 2000,
        totalUnits: 610,
        soldUnits: 0,
    },
    {
        index: 6,
        usdPrice: 2500,
        totalUnits: 987,
        soldUnits: 0,
    },
    {
        index: 7,
        usdPrice: 3000,
        totalUnits: 1597,
        soldUnits: 0,
    },
    {
        index: 8,
        usdPrice: 3500,
        totalUnits: 2584,
        soldUnits: 0,
    },
    {
        index: 9,
        usdPrice: 4000,
        totalUnits: 4181,
        soldUnits: 0,
    },
    {
        index: 10,
        usdPrice: 5000,
        totalUnits: 6765,
        soldUnits: 0,
    },
    {
        index: 11,
        usdPrice: 7000,
        totalUnits: 10946,
        soldUnits: 0,
    },
    {
        index: 12,
        usdPrice: 9500,
        totalUnits: 17711,
        soldUnits: 0,
    },
];

export const isZeroAddress = (address: string): boolean => address === '0x0000000000000000000000000000000000000000';
