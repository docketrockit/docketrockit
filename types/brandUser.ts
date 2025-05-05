import * as z from 'zod';

import { Prisma } from '@prisma/client';
import { type Table } from '@tanstack/react-table';

import { getBrandUsers } from '@/actions/admin/brandUsers';
import { User } from '@/lib/user';

import { brandUsersSearchParamsSchema } from '@/schemas/admin/brandUsers';

export type GetBrandUsersSchema = z.infer<typeof brandUsersSearchParamsSchema>;

export type BrandUsersFilterInput = {
    operator?: 'and' | 'or';
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    email?: string;
    merchantRole?: string;
    primaryContact?: boolean;
    status?: string;
    from?: string;
    to?: string;
    brandId?: string;
};

export type BrandUser = Prisma.UserGetPayload<{
    include: {
        primaryContactBrand: true;
        merchantUser: { include: { brandUsers: true } };
    };
}>;

export type Brand = Prisma.BrandGetPayload<{
    include: {
        state: true;
        country: true;
        primaryContact: true;
        merchant: true;
    };
}>;

export interface BrandUsersTableProps {
    brandUsersPromise: ReturnType<typeof getBrandUsers>;
    brand: Brand;
    user: User;
}

export interface BrandUsersTableFloatingBarProps {
    table: Table<BrandUser>;
}

export interface BrandUsersTableToolbarActionsProps {
    table: Table<BrandUser>;
    brand: Brand;
}
