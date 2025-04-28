import * as z from 'zod';
import { Country, State } from '@prisma/client';
import { Prisma, Merchant } from '@prisma/client';

import { merchantsSearchParamsSchema } from '@/schemas/admin/merchants';
import { getMerchantUsers } from '@/actions/admin/merchantUsers';
import { User } from '@/lib/user';
import { type getMerchants } from '@/actions/admin/merchants';
import { getMerchantBrands } from '@/actions/admin/merchantBrands';

type MerchantData = Prisma.MerchantGetPayload<{
    include: { state: true; country: true; primaryContact: true };
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
    merchantBrandsPromise: ReturnType<typeof getMerchantBrands>;
    user: User;
}

export type MerchantsFilterInput = {
    operator?: 'and' | 'or';
    name?: string;
    status?: string;
    from?: string;
    to?: string;
};

export type GetMerchantsSchema = z.infer<typeof merchantsSearchParamsSchema>;

export interface MerchantsTableProps {
    merchantsPromise: ReturnType<typeof getMerchants>;
    user: User;
}

export interface MerchantTabsProps {
    merchantUsersPromise: ReturnType<typeof getMerchantUsers>;
    merchantBrandsPromise: ReturnType<typeof getMerchantBrands>;
    merchant: Merchant;
    user: User;
}
