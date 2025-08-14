import * as z from 'zod';
import { getStringSchema, getEmailSchema } from './schemas';
import { isValidABN, isValidACN } from '@/utils/businessNumberValidation';

export const AddStoreSchema = z.object({
    brandSlug: getStringSchema('brand'),
    name: getStringSchema('Name'),
    phoneNumber: getStringSchema('Phone number'),
    address1: getStringSchema('Address line 1'),
    address2: z.string().optional(),
    formattedAddress: getStringSchema('Formatted address'),
    latitude: z
        .number()
        .refine((val) => val !== undefined && val !== null, {
            message: 'Latitude is required'
        })
        .refine((val) => typeof val === 'number' && !isNaN(val), {
            message: 'Latitude must be a valid number'
        }),
    longitude: z
        .number()
        .refine((val) => val !== undefined && val !== null, {
            message: 'Longitude is required'
        })
        .refine((val) => typeof val === 'number' && !isNaN(val), {
            message: 'Longitude must be a valid number'
        }),
    city: getStringSchema('City'),
    region: getStringSchema('Region'),
    postalCode: getStringSchema('Postal code'),
    country: getStringSchema('Country'),
    countryCode: z.string().optional(),
    currencyId: getStringSchema('currency'),
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
    address2: z.string().optional(),
    formattedAddress: getStringSchema('Formatted address'),
    latitude: z
        .number()
        .refine((val) => val !== undefined && val !== null, {
            message: 'Latitude is required'
        })
        .refine((val) => typeof val === 'number' && !isNaN(val), {
            message: 'Latitude must be a valid number'
        }),
    longitude: z
        .number()
        .refine((val) => val !== undefined && val !== null, {
            message: 'Longitude is required'
        })
        .refine((val) => typeof val === 'number' && !isNaN(val), {
            message: 'Longitude must be a valid number'
        }),
    city: getStringSchema('City'),
    region: getStringSchema('Region'),
    postalCode: getStringSchema('Postal code'),
    country: getStringSchema('Country'),
    countryCode: z.string().optional(),
    currencyId: getStringSchema('currency'),
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

export const storeFormSchema = z.object({
    brand: z.string().optional()
});
