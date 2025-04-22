import * as z from 'zod';

import { merchantUsersSearchParamsSchema } from '@/schemas/merchantUsers';
import { Prisma } from '@prisma/client';
import { type Table } from '@tanstack/react-table';

import { getMerchantUsers } from '@/actions/merchantUsers';

export type GetMerchantUsersSchema = z.infer<
    typeof merchantUsersSearchParamsSchema
>;

export type MerchantUsersFilterInput = {
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
};

export type MerchantUser = Prisma.UserGetPayload<{
    include: { merchantUser: true };
}>;

export interface MerchantUsersTableProps {
    merchantUsersPromise: ReturnType<typeof getMerchantUsers>;
}

export interface MerchantUsersTableFloatingBarProps {
    table: Table<MerchantUser>;
}

export interface MerchantUsersTableToolbarActionsProps {
    table: Table<MerchantUser>;
}
