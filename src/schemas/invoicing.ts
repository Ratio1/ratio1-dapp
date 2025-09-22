import { EXTRA_TAX_TYPES } from '@data/extraTaxTypes';
import { INVOICING_CURRENCIES } from '@data/invoicingCurrencies';
import z from 'zod';
import { getFloatSchema, getIntegerSchema, getStringSchema, getStringWithSpacesSchema } from './common';

const extraTaxSchema = z.object({
    description: getStringWithSpacesSchema(1, 512),
    taxType: z.enum(EXTRA_TAX_TYPES),
    value: getFloatSchema(100),
});

export const invoicingPreferencesSchema = z.object({
    userAddress: getStringWithSpacesSchema(1, 512),
    invoiceSeries: getStringSchema(1, 16),
    nextNumber: getIntegerSchema(100_000),
    countryVat: getFloatSchema(100),
    ueVat: getFloatSchema(100),
    extraUeVat: getFloatSchema(100),
    localCurrency: z.enum(INVOICING_CURRENCIES),
    extraText: getStringWithSpacesSchema(0, 1024),
    extraTaxes: z.array(extraTaxSchema).max(50, 'Maximum 50 extra tax entries allowed'),
});
