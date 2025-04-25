import * as z from 'zod';
import { Country, State } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { merchantsSearchParamsSchema } from '@/schemas/admin/merchants';
import { getMerchantUsers } from '@/actions/admin/merchantUsers';
import { User } from '@/lib/user';
import { type getMerchants } from '@/actions/admin/merchants';

type MerchantData = Prisma.MerchantGetPayload<{
    include: { state: true; country: true };
}>;

type PrimaryContact = Prisma.UserGetPayload<{
    select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phoneNumber: true;
    };
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
    user: User;
    primaryContact: PrimaryContact | null;
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
