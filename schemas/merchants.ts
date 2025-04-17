import {
    object,
    array,
    custom,
    optional,
    string,
    coerce,
    enum as enum_
} from 'zod';

import { getStringSchema, getEmailSchema } from './schemas';
import { isValidABN, isValidACN } from '@/utils/businessNumberValidation';

export const MerchantSchema = object({
    name: getStringSchema('Name'),
    phoneNumber: getStringSchema('Phone number'),
    genericEmail: getEmailSchema(),
    invoiceEmail: optional(getEmailSchema()),
    address1: getStringSchema('Address line 1'),
    address2: optional(getStringSchema('Address line 2')),
    suburb: getStringSchema('Suburb'),
    postcode: getStringSchema('Postcode'),
    state: getStringSchema('State'),
    country: getStringSchema('Country'),
    abn: getStringSchema('ABN')
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => val.length === 11, {
            message: 'ABN must be 11 digits'
        })
        .refine((val) => isValidABN(val), { message: 'Invalid ABN' }),
    acn: getStringSchema('ACN')
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => val.length === 9, { message: 'ACN must be 9 digits' })
        .refine((val) => isValidACN(val), { message: 'Invalid ACN' }),
    logoUrl: array(object({ value: custom<File>() }))
        .min(1, { message: 'Please add at least one image.' })
        .max(1, { message: 'You can only have one logo' })
});

export const MerchantSchemaCreate = object({
    name: getStringSchema('Name'),
    phoneNumber: getStringSchema('Phone number'),
    genericEmail: getEmailSchema(),
    invoiceEmail: optional(getEmailSchema()),
    address1: getStringSchema('Address line 1'),
    address2: optional(getStringSchema('Address line 2')),
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

export const merchantsSearchParamsSchema = object({
    page: coerce.number().default(1),
    per_page: coerce.number().default(10),
    sort: string().optional(),
    firstName: string().optional(),
    lastName: string().optional(),
    email: string().optional(),
    jobTitle: string().optional(),
    adminRole: string().optional(),
    status: string().optional(),
    from: string().optional(),
    to: string().optional(),
    operator: enum_(['and', 'or']).optional()
});
