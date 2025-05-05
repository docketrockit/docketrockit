import * as z from 'zod';

import { getStringSchema, getEmailSchema } from './schemas';
import { isValidABN, isValidACN } from '@/utils/businessNumberValidation';

export const AddStoreSchema = z.object({
    brandSlug: getStringSchema('brand'),
    name: getStringSchema('Name'),
    phoneNumber: getStringSchema('Phone number'),
    address1: getStringSchema('Address line 1'),
    address2: z.optional(z.string()),
    formattedAddress: getStringSchema('Formatted address'),
    latitude: z.number({
        required_error: 'Latitude is required',
        invalid_type_error: 'Latitude must be a number'
    }),
    longitude: z.number({
        required_error: 'Longitude is required',
        invalid_type_error: 'Longitude must be a number'
    }),
    city: getStringSchema('City'),
    region: getStringSchema('Region'),
    postalCode: getStringSchema('Postal code'),
    country: getStringSchema('Country'),
    countryCode: z.optional(z.string()),
    currency: getStringSchema('currency'),
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

export const EditStoreSchema = z.object({
    name: getStringSchema('Name'),
    phoneNumber: getStringSchema('Phone number'),
    address1: getStringSchema('Address line 1'),
    address2: z.optional(z.string()),
    formattedAddress: getStringSchema('Formatted address'),
    latitude: z.number({
        required_error: 'Latitude is required',
        invalid_type_error: 'Latitude must be a number'
    }),
    longitude: z.number({
        required_error: 'Longitude is required',
        invalid_type_error: 'Longitude must be a number'
    }),
    city: getStringSchema('City'),
    region: getStringSchema('Region'),
    postalCode: getStringSchema('Postal code'),
    country: getStringSchema('Country'),
    countryCode: z.optional(z.string()),
    currency: getStringSchema('currency'),
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
