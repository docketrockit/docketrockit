'use server';

import * as z from 'zod';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { type User as UserType } from '@prisma/client';

import db from '@/lib/db';
import { GetMerchantUsersSchema } from '@/types/merchantUsers';
import { authCheckAdmin } from '@/lib/authCheck';
import { getErrorMessage } from '@/lib/handleError';
import { checkMerchantEmailAvailability } from '@/lib/email';
import { globalPOSTRateLimit } from '@/lib/request';
import { createEmailVerificationRequest } from '@/lib/email-verification';
import { verifyPasswordStrength } from '@/lib/password';
import { sendCreateAdminUserAccountEmail } from '@/lib/mail';
import { createUser } from '@/lib/user';
import { MerchantUserSchema, MerchantUserSchemaUpdate } from '@/schemas/users';
import { buildMerchantUserWhere, buildOrderBy } from '@/lib/merchantUserLib';

export const getMerchantUsers = async (input: GetMerchantUsersSchema) => {
    const { user } = await authCheckAdmin();

    if (!user)
        return {
            data: null
        };
    const {
        page,
        per_page,
        sort,
        firstName,
        lastName,
        jobTitle,
        email,
        merchantRole,
        primaryContact,
        status,
        operator,
        from,
        to
    } = input;

    try {
        const offset = (page - 1) * per_page;
        const orderBy = buildOrderBy(sort);

        const fromDay = from ? format(new Date(from), 'yyyy-MM-dd') : undefined;
        const toDay = to ? format(new Date(to), 'yyyy-MM-dd') : undefined;

        const where = buildMerchantUserWhere({
            operator,
            firstName,
            lastName,
            email,
            jobTitle,
            merchantRole,
            primaryContact,
            status,
            from: fromDay,
            to: toDay
        });

        const data = await db.user.findMany({
            where,
            include: { merchantUser: true },
            skip: offset,
            take: per_page,
            orderBy
        });

        const total = await db.user.count({ where });

        const pageCount = Math.ceil(total / per_page);
        return { data, pageCount };
    } catch (err) {
        return { data: [], pageCount: 0 };
    }
};

export const updateMerchantUsers = async (input: {
    ids: string[];
    status?: UserType['status'];
}) => {
    const { user } = await authCheckAdmin(['ADMIN']);

    if (!user)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        const data = await db.user.updateMany({
            where: { id: { in: input.ids } },
            data: { status: input.status }
        });

        return {
            data,
            error: null
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err)
        };
    }
};

export const createAdminUser = async (
    values: z.infer<typeof MerchantUserSchema>,
    adminCreate: boolean,
    merchantId: string
) => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

    if (!adminUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                data: null,
                error: getErrorMessage('Too many requests')
            };
        }
        const validatedFields = MerchantUserSchema.safeParse(values);

        if (!validatedFields.success) {
            return { data: null, error: getErrorMessage('Invalid fields') };
        }

        const {
            firstName,
            lastName,
            email,
            password,
            jobTitle,
            merchantRole,
            primaryContact
        } = validatedFields.data;

        const emailAvailable = checkMerchantEmailAvailability(email);
        if (!emailAvailable) {
            return {
                data: null,
                error: getErrorMessage('Email is already used')
            };
        }

        const strongPassword = await verifyPasswordStrength(password);
        if (!strongPassword) {
            return { data: null, error: getErrorMessage('Weak password') };
        }
        const user = await createUser({
            email,
            password,
            firstName,
            lastName,
            role: 'ADMIN'
        });
        await db.merchantUser.create({
            data: {
                jobTitle,
                merchantRole,
                primaryContact,
                userId: user.id,
                merchantId
            }
        });
        const emailVerificationRequest = await createEmailVerificationRequest(
            user.id,
            user.email
        );
        await sendCreateAdminUserAccountEmail({
            email,
            firstName,
            password,
            code: emailVerificationRequest.code
        });

        if (adminCreate) revalidatePath('/merchant/users/merchant');

        return {
            data: user,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: getErrorMessage(error)
        };
    }
};
