'use server';

import type { CountryCode } from 'libphonenumber-js';
import { headers } from 'next/headers';

export interface AddressPlace {
    types: string[];
    businessStatus?:
        | 'OPERATIONAL'
        | 'CLOSED_TEMPORARILY'
        | 'CLOSED_PERMANENTLY'
        | '';
}

export const getGeolocation = async () => {
    const ipCountry = (await headers()).get(
        'x-vercel-ip-country'
    ) as CountryCode | null;

    return ipCountry;
};

export const isLikelyBusiness = async ({
    types,
    businessStatus
}: AddressPlace): Promise<boolean> => {
    const hasBusinessTypes = types.some((type) =>
        [
            'restaurant',
            'store',
            'establishment',
            'point_of_interest',
            'lodging',
            'doctor',
            'bar'
        ].includes(type)
    );

    const hasBusinessStatus = Boolean(businessStatus);

    return hasBusinessTypes || hasBusinessStatus;
};

export const isLikelyResidential = async ({
    types,
    businessStatus
}: AddressPlace): Promise<boolean> => {
    const residentialTypes = ['premise', 'street_address', 'subpremise'];

    const hasOnlyResidentialTypes = types.every((type) =>
        residentialTypes.includes(type)
    );

    const lacksBusinessIndicators = !businessStatus;
    return hasOnlyResidentialTypes || lacksBusinessIndicators;
};
