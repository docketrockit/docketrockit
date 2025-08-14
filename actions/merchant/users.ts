'use server';

import * as z from 'zod';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { type User as UserType } from '@/generated/prisma';

import db from '@/lib/db';
import { GetMerchantUsersSchema } from '@/types/merchant/user';
import { buildMerchantUserWhere, buildOrderBy } from '@/lib/merchant/userLib';
import { authCheckMerchant } from '@/lib/authCheck';
import { getErrorMessage } from '@/lib/handleError';
import { MerchantUserSchema, MerchantUserSchemaUpdate } from '@/schemas/users';
import { checkMerchantEmailAvailability } from '@/lib/email';
import { globalPOSTRateLimit } from '@/lib/request';
import { createEmailVerificationRequest } from '@/lib/email-verification';
import { verifyPasswordStrength } from '@/lib/password';
import {
    sendCreateAdminUserAccountEmail,
    sendUpdatedUserToAdminEmail
} from '@/lib/mail';
import { createUser, createUserFromUser, User } from '@/lib/user';

export const getMerchantUsers = async (input: GetMerchantUsersSchema) => {
    const {
        page,
        per_page,
        sort,
        firstName,
        lastName,
        jobTitle,
        email,
        merchantRole,
        brandId,
        merchantId,
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
            merchantId,
            merchantRole,
            brandId,
            status,
            from: fromDay,
            to: toDay
        });

        const data = await db.user.findMany({
            where,
            include: {
                merchantUser: {
                    include: { brandUsers: { include: { brand: true } } }
                }
            },
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
    const { user } = await authCheckMerchant(['ADMIN']);

    if (!user)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        await db.user.updateMany({
            where: { id: { in: input.ids } },
            data: { status: input.status }
        });

        revalidatePath('/merchant/users');

        return {
            data: null,
            error: null
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err)
        };
    }
};

export const createMerchantUser = async (
    values: z.infer<typeof MerchantUserSchema>
) => {
    const { user: adminUser } = await authCheckMerchant(['ADMIN']);

    if (!adminUser || !adminUser.merchantUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    const merchantId = adminUser.merchantUser.merchantId;

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
            primaryContact,
            phoneNumber
        } = validatedFields.data;

        const emailAvailable = await checkMerchantEmailAvailability(email);

        if (emailAvailable === 'No') {
            return {
                data: null,
                error: 'Email is already used on a merchant account'
            };
        }

        let userId: string;
        let user: User;

        if (emailAvailable === 'New') {
            const strongPassword = await verifyPasswordStrength(password);
            if (!strongPassword) {
                return { data: null, error: getErrorMessage('Weak password') };
            }
            user = await createUser({
                email,
                password,
                firstName,
                lastName,
                role: 'MERCHANT'
            });
            userId = user.id;
            const emailVerificationRequest =
                await createEmailVerificationRequest(user.id, user.email);
            await sendCreateAdminUserAccountEmail({
                email,
                firstName,
                password,
                code: emailVerificationRequest.code
            });
        } else {
            userId = emailAvailable.id;
            await db.user.update({
                where: { id: userId },
                data: {
                    role: { push: 'MERCHANT' }
                }
            });
            user = await createUserFromUser({ user: emailAvailable });
            await sendUpdatedUserToAdminEmail({
                email,
                firstName: user.firstName
            });
        }
        if (primaryContact) {
            await db.merchant.updateMany({
                where: { id: merchantId },
                data: { primaryContactId: userId }
            });
        }

        await db.user.update({ where: { id: userId }, data: { phoneNumber } });

        await db.merchantUser.create({
            data: {
                jobTitle,
                merchantRole,
                userId,
                merchantId
            }
        });

        revalidatePath('/merchant/users');

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
