import * as z from 'zod';

import { getStringSchema, getEmailSchema } from './schemas';
import { isValidABN, isValidACN } from '@/utils/businessNumberValidation';

export const AddMerchantSchema = z.object({
    merchantId: getStringSchema('Merchant'),
    name: getStringSchema('Name'),
    tradingAsName: getStringSchema('Trading as Name'),
    phoneNumber: getStringSchema('Phone number'),
    address1: getStringSchema('Address line 1'),
    address2: z.optional(getStringSchema('Address line 2')),
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

export const AddMerchantSchemaCreate = z.object({
    merchantId: getStringSchema('Merchant'),
    name: getStringSchema('Name'),
    tradingAsName: getStringSchema('Trading as Name'),
    phoneNumber: getStringSchema('Phone number'),
    address1: getStringSchema('Address line 1'),
    address2: z.optional(getStringSchema('Address line 2')),
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
