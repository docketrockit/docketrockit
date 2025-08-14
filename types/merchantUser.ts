import * as z from 'zod';

import { merchantUsersSearchParamsSchema } from '@/schemas/admin/merchantUsers';
import { Prisma, Merchant } from '@/generated/prisma';
import { type Table } from '@tanstack/react-table';

import { getMerchantUsers } from '@/actions/admin/merchantUsers';
import { User } from '@/lib/user';

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
    merchantId?: string;
};

export type MerchantUser = Prisma.UserGetPayload<{
    include: { primaryContactMerchant: true; merchantUser: true };
}>;

export interface MerchantUsersTableProps {
    merchantUsersPromise: ReturnType<typeof getMerchantUsers>;
    merchant: Merchant;
    user: User;
}

export interface MerchantUsersTableFloatingBarProps {
    table: Table<MerchantUser>;
}

export interface MerchantUsersTableToolbarActionsProps {
    table: Table<MerchantUser>;
    merchant: Merchant;
}
