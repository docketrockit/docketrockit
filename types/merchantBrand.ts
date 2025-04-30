import * as z from 'zod';

import { merchantBrandsSearchParamsSchema } from '@/schemas/admin/merchantBrands';
import { Prisma, Merchant } from '@prisma/client';
import { type Table } from '@tanstack/react-table';

import { getMerchantBrands } from '@/actions/admin/merchantBrands';
import { User } from '@/lib/user';

export type GetMerchantBrandsSchema = z.infer<
    typeof merchantBrandsSearchParamsSchema
>;

export type MerchantBrandsFilterInput = {
    operator?: 'and' | 'or';
    name?: string;
    tradingAsName?: string;
    primaryContact?: boolean;
    status?: string;
    from?: string;
    to?: string;
    merchantId?: string;
};

export type MerchantBrand = Prisma.BrandGetPayload<{
    include: { merchant: true; primaryContact: true };
}>;

export interface MerchantBrandsTableProps {
    merchantBrandsPromise: ReturnType<typeof getMerchantBrands>;
    user: User;
    merchant: Merchant;
}

export interface MerchantBrandsTableFloatingBarProps {
    table: Table<MerchantBrand>;
}

export interface MerchantBrandsTableToolbarActionsProps {
    table: Table<MerchantBrand>;
    user: User;
    slug: string;
}
