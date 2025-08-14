'use server';

import * as z from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Role } from '@/generated/prisma';

import {
    createPasswordResetSession,
    getPasswordResetTokenByToken,
    invalidateUserPasswordResetSessions,
    setPasswordResetSessionTokenCookie,
    deletePasswordResetSessionTokenCookie,
    validatePasswordResetSessionRequest
} from '@/lib/password-reset';
import { verifyPasswordStrength } from '@/lib/password';
import { sendPasswordResetEmail } from '@/lib/mail';
import { RefillingTokenBucket, ExpiringTokenBucket } from '@/lib/rate-limit';
import { globalPOSTRateLimit } from '@/lib/request';
import {
    generateSessionToken,
    invalidateUserSessions,
    deleteSessionTokenCookie,
    getCurrentSession
} from '@/lib/session';
import { getUserFromEmail, updateUserPassword } from '@/lib/user';
import { ForgotPasswordSchema, ResetPasswordSchema } from '@/schemas/auth';

const passwordResetEmailIPBucket = new RefillingTokenBucket<string>(3, 60);
const passwordResetEmailUserBucket = new RefillingTokenBucket<string>(3, 60);

interface ActionResult {
    result: boolean;
    message: string;
}

export const forgotPasswordAction = async (
    values: z.infer<typeof ForgotPasswordSchema>
): Promise<ActionResult> => {
    if (!(await globalPOSTRateLimit())) {
        return { result: false, message: 'Too many requests' };
    }
    // TODO: Assumes X-Forwarded-For is always included.
    const headerStore = await headers();
    const clientIP = headerStore.get('X-Forwarded-For');
    if (clientIP !== null && !passwordResetEmailIPBucket.check(clientIP, 1)) {
        return {
            result: false,
            message: 'Too many requests'
        };
    }

    const validatedFields = ForgotPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Invalid fields' };
    }

    const { email } = validatedFields.data;

    const user = await getUserFromEmail(email);
    if (user === null) {
        return { result: false, message: 'Account does not exist' };
    }
    if (clientIP !== null && !passwordResetEmailIPBucket.consume(clientIP, 1)) {
        return { result: false, message: 'Too many requests' };
    }
    if (!passwordResetEmailUserBucket.consume(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }
    if ([Role.ADMIN, Role.MERCHANT].some((role) => user.role.includes(role))) {
        return { result: false, message: 'Account does not exist' };
    }
    await invalidateUserPasswordResetSessions(user.id);
    const sessionToken = generateSessionToken();
    const session = await createPasswordResetSession(
        sessionToken,
        user.id,
        user.email
    );

    await sendPasswordResetEmail({ email: session.email, code: session.code });
    // await fetch('/api/auth/set-reset-cookie', {
    //     method: 'POST',
    //     body: JSON.stringify({ sessionToken, expiresAt: session.expiresAt }),
    //     headers: { 'Content-Type': 'application/json' }
    // });
    await setPasswordResetSessionTokenCookie(sessionToken, session.expiresAt);
    return { result: true, message: 'Token sent' };
};

export const checkResetToken = async (token: string): Promise<ActionResult> => {
    if (!(await globalPOSTRateLimit())) {
        return { result: false, message: 'Too many requests' };
    }
    // TODO: Assumes X-Forwarded-For is always included.
    const headerStore = await headers();
    const clientIP = headerStore.get('X-Forwarded-For');
    if (clientIP !== null && !passwordResetEmailIPBucket.check(clientIP, 1)) {
        return {
            result: false,
            message: 'Too many requests'
        };
    }

    if (!token)
        return {
            result: false,
            message: 'No token provided'
        };

    const { session, user } = await getPasswordResetTokenByToken(token);

    if (!session || !user)
        return {
            result: false,
            message: 'Invalid token provided'
        };

    if (Date.now() >= session.expiresAt.getTime()) {
        await invalidateUserPasswordResetSessions(user.id);
        // await deletePasswordResetSessionTokenCookie();
        await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/delete-reset-cookie`,
            { method: 'POST' }
        );
        return {
            result: false,
            message: 'Token expired, please try again'
        };
    }

    return { result: true, message: 'Token approved' };
};

export const resetPasswordAction = async (
    values: z.infer<typeof ResetPasswordSchema>
): Promise<ActionResult> => {
    if (!globalPOSTRateLimit()) {
        return { result: false, message: 'Too many requests' };
    }
    const { session: passwordResetSession } =
        await validatePasswordResetSessionRequest();
    if (passwordResetSession === null) {
        return { result: false, message: 'Not authenticated' };
    }

    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Invalid fields' };
    }

    const { password, confirmPassword } = validatedFields.data;

    if (password !== confirmPassword)
        return { result: false, message: "Passwords don't match" };

    const strongPassword = await verifyPasswordStrength(password);
    if (!strongPassword) {
        return { result: false, message: 'Weak password' };
    }
    await invalidateUserPasswordResetSessions(passwordResetSession.userId);
    await invalidateUserSessions(passwordResetSession.userId);
    await updateUserPassword(passwordResetSession.userId, password);
    await deletePasswordResetSessionTokenCookie();
    await deleteSessionTokenCookie();
    return redirect('/auth/login');
};

export const updatePasswordAction = async (
    values: z.infer<typeof ResetPasswordSchema>
): Promise<ActionResult> => {
    if (!globalPOSTRateLimit()) {
        return { result: false, message: 'Too many requests' };
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return { result: false, message: 'Not authenticated' };
    }

    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Invalid fields' };
    }

    const { password, confirmPassword } = validatedFields.data;

    if (password !== confirmPassword)
        return { result: false, message: "Passwords don't match" };

    const strongPassword = await verifyPasswordStrength(password);
    if (!strongPassword) {
        return { result: false, message: 'Weak password' };
    }
    await updateUserPassword(user.id, password);

    return redirect('/auth/verify-email');
};
