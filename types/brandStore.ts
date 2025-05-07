import * as z from 'zod';

import { brandStoresSearchParamsSchema } from '@/schemas/admin/brandStores';
import { Prisma, Brand } from '@prisma/client';
import { type Table } from '@tanstack/react-table';

import { getBrandStores } from '@/actions/admin/brandStores';
import { User } from '@/lib/user';

export type GetBrandStoresSchema = z.infer<
    typeof brandStoresSearchParamsSchema
>;

export type BrandStoresFilterInput = {
    operator?: 'and' | 'or';
    name?: string;
    country?: string;
    state?: string;
    status?: string;
    from?: string;
    to?: string;
    brandId?: string;
};

export type BrandStore = Prisma.StoreGetPayload<{
    include: {
        currency: true;
        country: true;
        brand: { include: { merchant: true } };
    };
}>;

export interface BrandStoresTableProps {
    brandStoresPromise: ReturnType<typeof getBrandStores>;
    user: User;
    brand: Brand;
}

export interface BrandStoresTableFloatingBarProps {
    table: Table<BrandStore>;
}

export interface BrandStoresTableToolbarActionsProps {
    table: Table<BrandStore>;
    user: User;
    slug: string;
}
