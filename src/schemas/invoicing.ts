import { INVOICING_CURRENCIES } from '@data/invoicingCurrencies';
import z from 'zod';
import { getFloatSchema, getIntegerSchema, getStringSchema, getStringWithSpacesSchema } from './common';

const extraTaxSchema = z.discriminatedUnion('taxType', [
    z.object({
        description: getStringWithSpacesSchema(1, 512),
        taxType: z.literal('Percentage'),
        value: getFloatSchema(100),
    }),
    z.object({
        description: getStringWithSpacesSchema(1, 512),
        taxType: z.literal('Fixed'),
        value: getFloatSchema(10_000_000),
    }),
]);

export const invoicingPreferencesSchema = z.object({
    invoiceSeries: getStringSchema(1, 16),
    nextNumber: getIntegerSchema(100_000),
    countryVat: getFloatSchema(100),
    ueVat: getFloatSchema(100),
    extraUeVat: getFloatSchema(100),
    localCurrency: z.enum(INVOICING_CURRENCIES),
    extraText: getStringWithSpacesSchema(0, 1024).optional(),
    extraTaxes: z.array(extraTaxSchema).max(50, 'Maximum 50 extra tax entries allowed'),
});
