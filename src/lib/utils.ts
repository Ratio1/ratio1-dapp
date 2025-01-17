import { AssignedLicense, UnassignedLicense } from 'types';

export const getShortAddress = (address: string, size = 4) => `${address.slice(0, size)}...${address.slice(-size)}`;

export function fN(num: number): string {
    if (num >= 1000) {
        const formattedNum = num / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${formattedNum.toFixed(1)}K`;
    }
    return num.toString();
}

export const isLicenseAssigned = (obj: UnassignedLicense | AssignedLicense): obj is AssignedLicense => {
    return 'alias' in obj && 'node_address' in obj;
};
