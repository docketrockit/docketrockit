'use server';

import * as z from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { verifyEmailInput } from '@/lib/email';
import {
    createPasswordResetSession,
    invalidateUserPasswordResetSessions,
    setPasswordResetSessionTokenCookie
} from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/mail';
import { RefillingTokenBucket } from '@/lib/rate-limit';
import { globalPOSTRateLimit } from '@/lib/request';
import { generateSessionToken } from '@/lib/session';
import { getUserFromEmail } from '@/lib/user';
import { ForgotPasswordSchema } from '@/schemas/auth';

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
    await invalidateUserPasswordResetSessions(user.id);
    const sessionToken = generateSessionToken();
    const session = await createPasswordResetSession(
        sessionToken,
        user.id,
        user.email
    );

    await sendPasswordResetEmail({ email: session.email, code: session.code });
    await setPasswordResetSessionTokenCookie(sessionToken, session.expiresAt);
    return { result: true, message: 'Token sent' };
};
