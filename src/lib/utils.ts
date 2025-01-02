export const getShortAddress = (address: string, size = 4) => `${address.slice(0, size)}...${address.slice(-size)}`;

export function formatNumber(num: number): string {
    if (num >= 1000) {
        const formattedNum = num / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${formattedNum.toFixed(1)}K`;
    }
    return num.toString();
}
