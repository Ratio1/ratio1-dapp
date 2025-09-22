import { EXTRA_TAX_TYPES } from '@data/extraTaxTypes';
import { INVOICING_CURRENCIES } from '@data/invoicingCurrencies';
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
    localCurrency: (typeof INVOICING_CURRENCIES)[number];
    extraTaxes?: { description: string; taxType: (typeof EXTRA_TAX_TYPES)[number]; value: number }[]; // Must be converted to a string when interacting with the API
};

export type { InvoiceDraft, InvoicingPreferences };
