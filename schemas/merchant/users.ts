import * as z from 'zod';

import { getMerchantUsers } from '@/actions/merchant/users';
import { User } from '@/lib/user';

export const merchantUsersSearchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    jobTitle: z.string().optional(),
    primaryContact: z.boolean().optional(),
    merchantRole: z.string().optional(),
    brandId: z.string().optional(),
    merchantId: z.string().optional(),
    status: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    operator: z.enum(['and', 'or']).optional()
});

export interface UsersTableProps {
    merchantUsersPromise: ReturnType<typeof getMerchantUsers>;
    user: User;
}
