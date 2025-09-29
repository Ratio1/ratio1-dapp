import { EthAddress } from './blockchain';

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

export type { InvoiceDraft, KycInfo };
