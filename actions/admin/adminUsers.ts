'use server';

import * as z from 'zod';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminUserSchema } from '@/schemas/users';
import { getErrorMessage } from '@/lib/handleError';
import { checkEmailAvailability } from '@/lib/email';
import { authCheckServerAdmin } from '@/lib/authCheck';
import { generateOTP } from '@/lib/otp';
import { sendCreateAdminUserAccountEmail } from '@/lib/mail';
import { logUserRegistered } from '@/actions/audit/audit-auth';

export const createAdminUser = async (
    values: z.infer<typeof AdminUserSchema>
) => {
    const userSession = await authCheckServerAdmin();

    if (!userSession)
        return {
            error: getErrorMessage('Unauthorized')
        };

    try {
        const validatedFields = AdminUserSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: getErrorMessage('Invalid fields') };
        }

        const {
            name,
            lastName,
            email,
            password,
            jobTitle,
            phoneNumber,
            permissions
        } = validatedFields.data;

        const emailAvailable = checkEmailAvailability(email);

        if (!emailAvailable) {
            return {
                error: getErrorMessage('Email is already used')
            };
        }

        const data = await auth.api.signUpEmail({
            body: {
                name,
                lastName,
                email,
                password,
                role: 'ADMIN'
            }
        });

        await prisma.user.update({
            where: { id: data.user.id },
            data: { phoneNumber }
        });
        await prisma.businessUserAccess.create({
            data: {
                jobTitle,
                accessLevel: 'ADMIN',
                userId: data.user.id,
                permissions,
                createdById: userSession.user.id
            }
        });

        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.verification.create({
            data: {
                identifier: `email-otp:${data.user.id}`,
                value: code,
                expiresAt
            }
        });

        await sendCreateAdminUserAccountEmail({
            email,
            name,
            password,
            code
        });

        await logUserRegistered(data.user.id, {
            registeredBy: userSession.user.id
        });

        revalidatePath('/admin/users/admin');

        return {
            error: null
        };
    } catch (error) {
        return {
            error: getErrorMessage(error)
        };
    }
};

// export const updateAdminUser = async (
//     values: z.infer<typeof AdminUserSchemaUpdate>,
//     id: string
// ) => {
//     const { user: adminUser } = await authCheckAdmin(['ADMIN']);

//     if (!adminUser)
//         return {
//             data: null,
//             error: getErrorMessage('Unauthorized')
//         };

//     try {
//         if (!(await globalPOSTRateLimit())) {
//             return {
//                 data: null,
//                 error: getErrorMessage('Too many requests')
//             };
//         }
//         const validatedFields = AdminUserSchemaUpdate.safeParse(values);

//         if (!validatedFields.success) {
//             return { data: null, error: getErrorMessage('Invalid fields') };
//         }

//         const { firstName, lastName, email, jobTitle, adminRole, phoneNumber } =
//             validatedFields.data;

//         const emailAvailable = checkEmailAvailability(email);
//         if (!emailAvailable) {
//             return {
//                 data: null,
//                 error: getErrorMessage('Email is already used')
//             };
//         }
//         await db.user.update({
//             where: { id },
//             data: {
//                 firstName,
//                 lastName,
//                 email,
//                 phoneNumber,
//                 adminUser: {
//                     update: {
//                         jobTitle,
//                         adminRole
//                     }
//                 }
//             }
//         });

//         revalidatePath('/admin/users/admin');

//         return {
//             data: null,
//             error: null
//         };
//     } catch (err) {
//         return {
//             data: null,
//             error: getErrorMessage(err)
//         };
//     }
// };
