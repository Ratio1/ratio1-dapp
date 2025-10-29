import { z } from 'zod';

export const getStringSchema = (minLength: number, maxLength: number) => {
    return z
        .string()
        .min(minLength, `Value must be at least ${minLength} characters`)
        .max(maxLength, `Value cannot exceed ${maxLength} characters`)
        .refine(
            (val) => val === '' || /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/.test(val),
            'Only letters, numbers and special characters allowed',
        );
};

export const getStringWithSpacesSchema = (minLength: number, maxLength: number) => {
    return z
        .string()
        .min(minLength, `Value must be at least ${minLength} characters`)
        .max(maxLength, `Value cannot exceed ${maxLength} characters`)
        .regex(
            /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
            'Only letters, numbers, spaces and special characters allowed',
        );
};

export const getOptionalStringWithSpacesSchema = (minLength: number, maxLength: number) => {
    return z.union([
        z.literal(''),
        z
            .string()
            .min(minLength, `Value must be at least ${minLength} characters`)
            .max(maxLength, `Value cannot exceed ${maxLength} characters`)
            .regex(
                /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
                'Only letters, numbers, spaces and special characters allowed',
            ),
    ]);
};

export const getIntegerSchema = (max: number) => {
    return z
        .union([
            z.literal(''),
            z
                .number()
                .int('Value must be a whole number')
                .min(0, 'Value must be at least 0')
                .max(max, `Value cannot exceed ${max}`),
        ])
        .refine((val) => val !== '', { message: 'Value is required' })
        .transform((val) => val as number) as z.ZodType<number>;
};

export const getFloatSchema = (max: number) => {
    return z
        .union([
            z.literal(''),
            z.string().transform((val) => {
                if (val === '') return '';
                const num = parseFloat(val);
                if (isNaN(num)) throw new Error('Invalid number format');
                return num;
            }),
            z.number().min(0, 'Value must be at least 0').max(max, `Value cannot exceed ${max}`),
        ])
        .refine((val) => val !== '', { message: 'Value is required' })
        .transform((val) => val as number) as z.ZodType<number>;
};

export const getURISchema = () => {
    return z
        .string({ required_error: 'Value is required' })
        .max(128, 'Value cannot exceed 128 characters')
        .regex(/^https?:\/\/.+/, 'Must be a valid http or https URL');
};
