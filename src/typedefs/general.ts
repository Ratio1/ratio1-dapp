import { EthAddress } from './blockchain';

export const BRANDING_PLATFORM_NAMES = {
    Linkedin: 'LinkedIn',
};

type InvoiceDraft = {
    invoiceId: string;
    creationTimestamp: string;
    userAddress: EthAddress;
    cspOwnerAddress: EthAddress;
    totalUsdcAmount: number;
    invoiceSeries: string;
    invoiceNumber: number;
    nodeOwnerName: string;
    cspOwnerName: string;
};

type KycInfo = {
    address: string;
    city: string;
    country: string;
    email: string;
    identificationCode: string;
    isCompany: boolean;
    name: string;
    state: string;
};

type PublicProfileInfo = {
    name: string;
    description: string;
    links: Record<string, string>;
};

export type { InvoiceDraft, KycInfo, PublicProfileInfo };
