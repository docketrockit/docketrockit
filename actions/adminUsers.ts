'use server';

import * as z from 'zod';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { type User as UserType } from '@prisma/client';

import db from '@/lib/db';
import { GetAdminUsersSchema } from '@/types/adminUsers';
import { buildAdminUserWhere, buildOrderBy } from '@/lib/adminUserLib';
import { authCheckRole } from '@/lib/authCheck';
import { getErrorMessage } from '@/lib/handleError';

import { AdminUserSchema } from '@/schemas/users';
import { checkEmailAvailability } from '@/lib/email';
import { globalPOSTRateLimit } from '@/lib/request';
import { ExpiringTokenBucket } from '@/lib/rate-limit';
import { createEmailVerificationRequest } from '@/lib/email-verification';
import { verifyPasswordStrength } from '@/lib/password';
import { sendCreateUserAccountEmail } from '@/lib/mail';
import { createUser } from '@/lib/user';

interface ActionResult {
    result: boolean;
    message: string;
}

export const getAdminUsers = async (input: GetAdminUsersSchema) => {
    const {
        page,
        per_page,
        sort,
        firstName,
        lastName,
        jobTitle,
        email,
        adminRole,
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

        const where = buildAdminUserWhere({
            operator,
            firstName,
            lastName,
            email,
            jobTitle,
            adminRole,
            status,
            from: fromDay,
            to: toDay
        });

        const data = await db.user.findMany({
            where,
            include: { adminUser: true },
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

export const updateAdminUsers = async (input: {
    ids: string[];
    status?: UserType['status'];
}) => {
    const { user } = await authCheckRole({
        roles: ['ADMIN'],
        access: ['ADMIN']
    });

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

        revalidatePath('/merchant/users/admin');

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

export const createAdminUser = async (
    values: z.infer<typeof AdminUserSchema>
) => {
    const { user: adminUser } = await authCheckRole({
        roles: ['ADMIN'],
        access: ['ADMIN']
    });

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
        const validatedFields = AdminUserSchema.safeParse(values);

        if (!validatedFields.success) {
            return { data: null, error: getErrorMessage('Invalid fields') };
        }

        const { firstName, lastName, email, password, jobTitle, adminRole } =
            validatedFields.data;

        const emailAvailable = checkEmailAvailability(email);
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
        await db.adminUser.create({
            data: {
                jobTitle,
                adminRole,
                userId: user.id
            }
        });
        const emailVerificationRequest = await createEmailVerificationRequest(
            user.id,
            user.email
        );
        await sendCreateUserAccountEmail({
            email,
            firstName,
            password,
            code: emailVerificationRequest.code
        });

        revalidatePath('/merchant/users/admin');

        return {
            data: null,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: getErrorMessage(error)
        };
    }
};

// export const getAdminUsers = async (input: GetAdminUsersSchema) => {
//     const {
//         page,
//         per_page,
//         sort,
//         firstName,
//         lastName,
//         jobTitle,
//         email,
//         adminRole,
//         status,
//         operator,
//         from,
//         to
//     } = input;

//     try {
//         const offset = (page - 1) * per_page;
//         const [column, order] = (sort?.split('.').filter(Boolean) ?? [
//             'name',
//             'asc'
//         ]) as [keyof User | undefined, 'asc' | 'desc' | undefined];

//         const fromDay = from ? format(new Date(from), 'yyyy-MM-dd') : undefined;
//         const toDay = to ? format(new Date(to), 'yyyy-MM-dd') : undefined;

//         const whereFilter = [];
//         const adminWhereFilter = [];

//         if (firstName) {
//             whereFilter.push(
//                 filterColumn({
//                     column: 'firstName',
//                     value: firstName
//                 })
//             );
//         }

//         if (lastName) {
//             whereFilter.push(
//                 filterColumn({
//                     column: 'lastName',
//                     value: lastName
//                 })
//             );
//         }

//         if (email) {
//             whereFilter.push(
//                 filterColumn({
//                     column: 'email',
//                     value: email
//                 })
//             );
//         }

//         if (jobTitle) {
//             adminWhereFilter.push(
//                 filterColumn({
//                     column: 'jobTitle',
//                     value: jobTitle
//                 })
//             );
//         }

//         if (adminRole) {
//             adminWhereFilter.push(
//                 filterColumn({
//                     column: 'adminRole',
//                     value: adminRole,
//                     isSelectable: true
//                 })
//             );
//         }

//         if (status) {
//             whereFilter.push(
//                 filterColumn({
//                     column: 'status',
//                     value: status,
//                     isSelectable: true
//                 })
//             );
//         }

//         if (fromDay) whereFilter.push({ createdAt: { gte: fromDay } });

//         if (toDay) whereFilter.push({ createdAt: { lte: toDay } });

//         let usedFilter;
//         let adminUserFilter;

//         if (!operator || operator === 'and') {
//             usedFilter = { AND: [...whereFilter] };
//             adminUserFilter = { AND: [...adminWhereFilter] };
//         } else {
//             usedFilter = { OR: [...whereFilter] };
//             adminUserFilter = { AND: [...adminWhereFilter] };
//         }

//         const orderBy = [{ [`${column}`]: `${order}` }];

//         const adminUserExistsFilter =
//             adminWhereFilter.length > 0
//                 ? {
//                       NOT: { adminUser: null },
//                       adminUser: adminUserFilter
//                   }
//                 : {
//                       NOT: { adminUser: null }
//                   };

//         const data = await db.user.findMany({
//             where: {
//                 ...usedFilter,
//                 ...adminUserExistsFilter
//             },
//             include: { adminUser: true },
//             skip: offset,
//             take: per_page,
//             orderBy
//         });

//         const total = await db.user.count({
//             where: {
//                 ...usedFilter,
//                 adminUser: {
//                     isNot: null,
//                     ...adminUserFilter
//                 }
//             }
//         });

//         const pageCount = Math.ceil(total / per_page);
//         return { data, pageCount };
//     } catch (err) {
//         return { data: [], pageCount: 0 };
//     }
// };
