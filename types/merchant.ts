import * as z from 'zod';
import { Country, State } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { merchantsSearchParamsSchema } from '@/schemas/merchants';
import { getMerchantUsers } from '@/actions/merchantUsers';

type MerchantData = Prisma.MerchantGetPayload<{
    include: { state: true; country: true };
}>;

export interface AddMerchantFormProps {
    countryProp?: Country;
    countries: Country[];
    states: State[];
}

export interface EditMerchantFormProps {
    merchant: MerchantData;
    countries: Country[];
    states: State[];
    stateProp?: State;
    countryProp?: Country;
}

export interface MerchantMainProps {
    merchant: MerchantData;
    merchantUsersPromise: ReturnType<typeof getMerchantUsers>;
}

export type MerchantsFilterInput = {
    operator?: 'and' | 'or';
    name?: string;
    status?: string;
    from?: string;
    to?: string;
};

export type GetMerchantsSchema = z.infer<typeof merchantsSearchParamsSchema>;
