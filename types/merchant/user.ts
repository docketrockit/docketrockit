import * as z from 'zod';
import { AdminRole, Prisma } from '@/generated/prisma';

import { merchantUsersSearchParamsSchema } from '@/schemas/merchant/users';

export type MerchantUser = Prisma.UserGetPayload<{
    include: {
        merchantUser: {
            include: { brandUsers: { include: { brand: true } } };
        };
    };
}>;

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
    brandId?: string;
};
