import * as z from 'zod';

import { brandsSearchParamsSchema } from '@/schemas/merchant/brands';
import { Prisma, Country, State } from '@prisma/client';
import { type Table } from '@tanstack/react-table';

import { getBrands } from '@/actions/merchant/brands';
import { User } from '@/lib/user';

export type GetBrandsSchema = z.infer<typeof brandsSearchParamsSchema>;

type Merchant = Prisma.MerchantGetPayload<{
    select: { id: true; name: true; slug: true };
}>;

export type BrandsFilterInput = {
    operator?: 'and' | 'or';
    name?: string;
    tradingAsName?: string;
    primaryContact?: boolean;
    status?: string;
    from?: string;
    to?: string;
    merchantId?: string;
};

export type Brand = Prisma.BrandGetPayload<{
    include: {
        state: true;
        country: true;
        primaryContact: true;
        merchant: true;
    };
}>;

export interface BrandsTableProps {
    brandsPromise: ReturnType<typeof getBrands>;
    user: User;
}

export interface BrandsTableFloatingBarProps {
    table: Table<Brand>;
}

export interface BrandsTableToolbarActionsProps {
    table: Table<Brand>;
    user: User;
}

export interface AddBrandFormProps {
    countryProp?: Country;
    countries: Country[];
    states: State[];
    merchantSlug: string;
}

export interface EditBrandFormProps {
    brand: Brand;
    countryProp?: Country;
    countries: Country[];
    states: State[];
    stateProp?: State;
}
