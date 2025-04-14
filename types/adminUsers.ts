import * as z from 'zod';

import { adminUsersSearchParamsSchema } from '@/schemas/adminUsers';

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
