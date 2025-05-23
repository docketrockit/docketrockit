'use server';

import * as z from 'zod';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import db from '@/lib/db';
import {
    UserProfileSchema,
    EmailSchema,
    VerifyEmailSchema
} from '@/schemas/users';
import { globalPOSTRateLimit } from '@/lib/request';
import { getCurrentSession } from '@/lib/session';
import { ExpiringTokenBucket } from '@/lib/rate-limit';
import {
    createEmailVerificationRequest,
    deleteEmailVerificationRequestCookie,
    deleteUserEmailVerificationRequest,
    getUserEmailVerificationRequestFromRequest,
    sendVerificationEmailBucket,
    setEmailVerificationRequestCookie
} from '@/lib/email-verification';
import {
    sendVerificationEmail,
    sendUserPasswordResetEmail,
    sendUserTwoFactorResetEmail
} from '@/lib/mail';
import { authCheckAdmin } from '@/lib/authCheck';
import { getErrorMessage } from '@/lib/handleError';
import { updateUserEmailAndSetEmailAsVerified } from '@/lib/user';
import generatePassword from '@/utils/generatePassword';
import { hashPassword } from '@/lib/password';

const bucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export type UserProfileDetailsAdmin = Prisma.UserGetPayload<{
    include: {
        state: { include: { country: true } };
        merchantUser: true;
        adminUser: true;
    };
}>;

interface ActionResult {
    result: boolean;
    message: string;
}

export const getUserProfileDetailsAdmin = async (
    id: string
): Promise<{ data: UserProfileDetailsAdmin | null; error: Error | null }> => {
    try {
        const user = await db.user.findUnique({
            where: { id },
            include: {
                state: { include: { country: true } },
                merchantUser: true,
                adminUser: true
            }
        });
        const hasAdminMerchant = user?.role.some((role) =>
            ['MERCHANT', 'ADMIN'].includes(role)
        );

        if (!hasAdminMerchant)
            return {
                data: null,
                error: new Error(String('Not authorised'))
            };
        return { data: user, error: null };
    } catch (error) {
        const typedError =
            error instanceof Error ? error : new Error(String(error));
        return { data: null, error: typedError };
    }
};

export const updateUserProfileAdmin = async (
    values: z.infer<typeof UserProfileSchema>
): Promise<ActionResult> => {
    if (!(await globalPOSTRateLimit())) {
        return {
            result: false,
            message: 'Too many requests'
        };
    }

    const { session, user } = await getCurrentSession();
    if (session === null) {
        return { result: false, message: 'Not authenticated' };
    }
    const hasAdminMerchant = user.role.some((role) =>
        ['MERCHANT', 'ADMIN'].includes(role)
    );

    if (!hasAdminMerchant)
        return {
            result: false,
            message: 'Not authorised'
        };
    const validatedFields = UserProfileSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Invalid fields' };
    }

    const {
        firstName,
        lastName,
        phoneNumber,
        jobTitle,
        state,
        postcode,
        city
    } = validatedFields.data;

    const stateId = await db.state.findFirst({ where: { isoCode: state } });

    if (!stateId) return { result: false, message: 'Invalid fields' };

    await db.user.update({
        where: { id: user.id },
        data: {
            firstName,
            lastName,
            phoneNumber,
            stateId: stateId.id,
            postcode,
            city
        }
    });

    if (user.adminUser) {
        await db.adminUser.update({
            where: { userId: user.id },
            data: { jobTitle }
        });
    }

    if (user.merchantUser) {
        await db.merchantUser.update({
            where: { userId: user.id },
            data: { jobTitle }
        });
    }

    await getCurrentSession();
    if (user.role.includes('ADMIN')) {
        revalidatePath('/admin/profile');
    } else {
        revalidatePath('/merchant/profile');
    }

    return { result: true, message: 'Profile Updated' };
};

export const verifyEmailUpdateCode = async (
    values: z.infer<typeof EmailSchema>
): Promise<ActionResult> => {
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return { result: false, message: 'Not authenticated' };
    }
    if (!sendVerificationEmailBucket.check(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }
    if (!sendVerificationEmailBucket.consume(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }
    const hasAdminMerchant = user.role.some((role) =>
        ['MERCHANT', 'ADMIN'].includes(role)
    );

    if (!hasAdminMerchant)
        return {
            result: false,
            message: 'Not authorised'
        };
    const validatedFields = EmailSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Please enter a valid code' };
    }

    const { email } = validatedFields.data;
    const verificationRequest = await createEmailVerificationRequest(
        user.id,
        email
    );
    await sendVerificationEmail({
        email: verificationRequest.email,
        code: verificationRequest.code
    });
    await setEmailVerificationRequestCookie(verificationRequest);
    return { result: true, message: 'A new code was sent to your inbox.' };
};

export const verifyEmailCode = async (
    values: z.infer<typeof VerifyEmailSchema>
): Promise<ActionResult> => {
    if (!(await globalPOSTRateLimit())) {
        return { result: false, message: 'Too many requests' };
    }

    const { session, user } = await getCurrentSession();
    if (session === null) {
        return { result: false, message: 'Not authenticated' };
    }
    if (user.registered2FA && !session.twoFactorVerified) {
        return { result: false, message: 'Forbidden' };
    }
    if (!bucket.check(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }
    const hasAdminMerchant = user.role.some((role) =>
        ['MERCHANT', 'ADMIN'].includes(role)
    );

    if (!hasAdminMerchant)
        return {
            result: false,
            message: 'Not authorised'
        };

    let verificationRequest =
        await getUserEmailVerificationRequestFromRequest();
    if (verificationRequest === null) {
        return { result: false, message: 'Not authenticated' };
    }

    const validatedFields = VerifyEmailSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Please enter a valid code' };
    }

    const { code } = validatedFields.data;

    if (!bucket.consume(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }
    if (Date.now() >= verificationRequest.expiresAt.getTime()) {
        verificationRequest = await createEmailVerificationRequest(
            verificationRequest.userId,
            verificationRequest.email
        );
        sendVerificationEmail({
            email: verificationRequest.email,
            code: verificationRequest.code
        });
        return {
            result: false,
            message:
                'The verification code was expired. We sent another code to your inbox.'
        };
    }
    if (verificationRequest.code !== code) {
        return { result: false, message: 'Incorrect code' };
    }
    await deleteUserEmailVerificationRequest(user.id);
    await updateUserEmailAndSetEmailAsVerified(
        user.id,
        verificationRequest.email
    );
    await deleteEmailVerificationRequestCookie();

    return { result: true, message: 'Email successfully updated' };
};

export const resetUserPassword = async (id: string): Promise<ActionResult> => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

    if (!adminUser)
        return {
            result: false,
            message: getErrorMessage('Unauthorized')
        };

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                result: false,
                message: getErrorMessage('Too many requests')
            };
        }

        const password = generatePassword(12);
        const passwordHash = await hashPassword(password);
        const user = await db.user.update({
            where: { id },
            data: { password: passwordHash, passwordVerified: false }
        });
        if (!user) return { result: false, message: 'User not found' };
        sendUserPasswordResetEmail({
            email: user.email,
            firstName: user.firstName,
            password
        });
        return { result: true, message: 'Password successfully reset' };
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            // P2025 = "An operation failed because it depends on one or more records that were required but not found"
            return { result: false, message: 'User not found' };
        }
        return {
            result: false,
            message: getErrorMessage(error)
        };
    }
};

export const resetUserTwoFactor = async (id: string): Promise<ActionResult> => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

    if (!adminUser)
        return {
            result: false,
            message: getErrorMessage('Unauthorized')
        };

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                result: false,
                message: getErrorMessage('Too many requests')
            };
        }

        const user = await db.user.update({
            where: { id },
            data: { totpKey: null, recoveryCodes: [] }
        });
        if (!user) return { result: false, message: 'User not found' };
        sendUserTwoFactorResetEmail({
            email: user.email,
            firstName: user.firstName
        });
        return { result: true, message: 'Two factor successfully reset' };
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            // P2025 = "An operation failed because it depends on one or more records that were required but not found"
            return { result: false, message: 'User not found' };
        }
        return {
            result: false,
            message: getErrorMessage(error)
        };
    }
};
