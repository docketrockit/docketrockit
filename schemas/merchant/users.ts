import * as z from 'zod';
import { MerchantRole, BrandRole } from '@prisma/client';

import { getMerchantUsers } from '@/actions/merchant/users';
import { getStringSchema, getEmailSchema, getPasswordSchema } from '../schemas';
import { User } from '@/lib/user';

const merchantRoleSchema = z.nativeEnum(MerchantRole);
const brandRoleSchema = z.nativeEnum(BrandRole);

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

export const MerchantUserSchema = z.object({
    firstName: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    password: getPasswordSchema('Password'),
    phoneNumber: getStringSchema('Phone number'),
    jobTitle: getStringSchema('Job title'),
    merchantRole: z.array(merchantRoleSchema || ''),
    primaryContact: z.boolean()
});
