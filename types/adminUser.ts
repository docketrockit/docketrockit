import * as z from 'zod';

import { adminUsersSearchParamsSchema } from '@/schemas/admin/adminUsers';
import { Prisma } from '@prisma/client';

export type GetAdminUsersSchema = z.infer<typeof adminUsersSearchParamsSchema>;

export type AdminUsersFilterInput = {
    operator?: 'and' | 'or';
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    email?: string;
    adminRole?: string;
    status?: string;
    from?: string;
    to?: string;
};

export type AdminUser = Prisma.UserGetPayload<{
    include: { adminUser: true };
}>;
