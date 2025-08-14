import * as z from 'zod';

import { getStringSchema, getEmailSchema } from './schemas';
import { isValidABN, isValidACN } from '@/utils/businessNumberValidation';

export const AddBrandSchema = z.object({
    merchantSlug: getStringSchema('Merchant'),
    name: getStringSchema('Name'),
    tradingAsName: getStringSchema('Trading as Name'),
    phoneNumber: getStringSchema('Phone number'),
    genericEmail: getEmailSchema(),
    invoiceEmail: z.email({ message: 'Invalid email address' }).optional(),
    address1: getStringSchema('Address line 1'),
    address2: z.optional(z.string()),
    suburb: getStringSchema('Suburb'),
    postcode: getStringSchema('Postcode'),
    state: getStringSchema('State'),
    country: getStringSchema('Country'),
    abn: getStringSchema('ABN')
        .length(11, 'ABN must be 11 digits')
        .refine((abn) => isValidABN(abn), {
            message: 'Invalid ABN'
        }),
    acn: getStringSchema('ACN')
        .length(9, 'ACN must be 9 digits')
        .refine((acn) => isValidACN(acn), {
            message: 'Invalid ACN'
        }),
    logoUrl: z
        .array(z.object({ value: z.custom<File>() }))
        .min(1, { message: 'Please add at least one image.' })
        .max(1, { message: 'You can only have one logo' })
});

export const AddBrandSchemaCreate = z.object({
    merchantSlug: getStringSchema('Merchant'),
    name: getStringSchema('Name'),
    tradingAsName: getStringSchema('Trading as Name'),
    genericEmail: getEmailSchema(),
    invoiceEmail: z.email({ message: 'Invalid email address' }).optional(),
    phoneNumber: getStringSchema('Phone number'),
    address1: getStringSchema('Address line 1'),
    address2: z.optional(z.string()),
    suburb: getStringSchema('Suburb'),
    postcode: getStringSchema('Postcode'),
    state: getStringSchema('State'),
    country: getStringSchema('Country'),
    abn: getStringSchema('ABN')
        .length(11, 'ABN must be 11 digits')
        .refine((abn) => isValidABN(abn), {
            message: 'Invalid ABN'
        }),
    acn: getStringSchema('ACN')
        .length(9, 'ACN must be 9 digits')
        .refine((acn) => isValidACN(acn), {
            message: 'Invalid ACN'
        }),
    logoUrl: getStringSchema('Logo url')
});

export const brandFormSchema = z.object({
    merchant: z.string().optional()
});

export const EditBrandSchema = z.object({
    name: getStringSchema('Name'),
    tradingAsName: getStringSchema('Trading as Name'),
    phoneNumber: getStringSchema('Phone number'),
    genericEmail: getEmailSchema(),
    invoiceEmail: z.email({ message: 'Invalid email address' }).optional(),
    address1: getStringSchema('Address line 1'),
    address2: z.optional(z.string()),
    suburb: getStringSchema('Suburb'),
    postcode: getStringSchema('Postcode'),
    state: getStringSchema('State'),
    country: getStringSchema('Country'),
    abn: getStringSchema('ABN')
        .length(11, 'ABN must be 11 digits')
        .refine((abn) => isValidABN(abn), {
            message: 'Invalid ABN'
        }),
    acn: getStringSchema('ACN')
        .length(9, 'ACN must be 9 digits')
        .refine((acn) => isValidACN(acn), {
            message: 'Invalid ACN'
        })
});
