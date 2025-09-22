import { EthAddress } from './blockchain';

type InvoiceDraft = {
    draftId: string;
    creationTimestamp: string;
    userAddress: EthAddress;
    cspOwnerAddress: EthAddress;
    totalUsdcAmount: number;
    invoiceSeries: string;
    invoiceNumber: number;
    nodeOwnerName: string;
    cspOwnerName: string;
};

type InvoicingPreferences = {
    userAddress: string;
    invoiceSeries: string;
    nextNumber: number;
    countryVat: number;
    ueVat: number;
    extraUeVat: number;
    extraText?: string;
    localCurrency: string;
    extraTaxes?: string; // Example: "JSON Array of objects { description: string; taxType: 0 | 1; value: number }". For taxType 0 means fixed value and 1 means percentage value.
};

export type { InvoiceDraft, InvoicingPreferences };
