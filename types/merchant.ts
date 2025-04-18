import * as z from 'zod';
import { Country, State } from '@prisma/client';

import { merchantsSearchParamsSchema } from '@/schemas/merchants';

export interface AddMerchantFormProps {
    stateProp?: State;
    countryProp?: Country;
    countries: Country[];
    states: State[];
}

export type MerchantsFilterInput = {
    operator?: 'and' | 'or';
    name?: string;
    status?: string;
    from?: string;
    to?: string;
};

export type GetMerchantsSchema = z.infer<typeof merchantsSearchParamsSchema>;
