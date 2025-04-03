'use server';

import * as z from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeBase64 } from '@oslojs/encoding';
import { verifyTOTPWithGracePeriod } from '@oslojs/otp';

import { verifyPasswordHash } from '@/lib/password';
import { totpBucket } from '@/lib/2fa';
import {
    RefillingTokenBucket,
    Throttler,
    ExpiringTokenBucket
} from '@/lib/rate-limit';
import {
    createSession,
    generateSessionToken,
    setSessionTokenCookie,
    getCurrentSession,
    setSessionAs2FAVerified
} from '@/lib/session';
import {
    getUserFromEmail,
    getUserPasswordHash,
    updateUserEmailAndSetEmailAsVerified,
    updateUserTOTPKey,
    getUserTOTPKey
} from '@/lib/user';
import { globalPOSTRateLimit } from '@/lib/request';
import {
    LoginSchema,
    VerifyEmailSchema,
    TwoFactorSetupSchema,
    TwoFactorVerficationSchema
} from '@/schemas/auth';
import type { SessionFlags } from '@/lib/session';
import {
    createEmailVerificationRequest,
    deleteEmailVerificationRequestCookie,
    deleteUserEmailVerificationRequest,
    getUserEmailVerificationRequestFromRequest,
    sendVerificationEmailBucket,
    setEmailVerificationRequestCookie
} from '@/lib/email-verification';
import { sendVerificationEmail } from '@/lib/mail';
import { invalidateUserPasswordResetSessions } from '@/lib/password-reset';

interface ActionResult {
    result: boolean;
    message: string;
}

const throttler = new Throttler<string>([1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);
const bucket = new ExpiringTokenBucket<string>(5, 60 * 30);
const totpUpdateBucket = new RefillingTokenBucket<string>(3, 60 * 10);

export const login = async (
    values: z.infer<typeof LoginSchema>
): Promise<ActionResult> => {
    if (!(await globalPOSTRateLimit())) {
        return {
            result: false,
            message: 'Too many requests'
        };
    }
    // TODO: Assumes X-Forwarded-For is always included.
    const headerStore = await headers();
    const clientIP = headerStore.get('X-Forwarded-For');
    const userAgent = headerStore.get('user-agent');
    if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
        return {
            result: false,
            message: 'Too many requests'
        };
    }

    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Invalid fields' };
    }

    const { email, password, rememberMe } = validatedFields.data;

    const user = await getUserFromEmail(email);
    if (user === null) {
        return {
            result: false,
            message: 'Invalid email and password combination'
        };
    }
    if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
        return { result: false, message: 'Too many requests' };
    }

    if (!throttler.consume(user.id)) {
        return { result: false, message: 'Too many requests' };
    }
    const passwordHash = await getUserPasswordHash(user.id);
    const validPassword = await verifyPasswordHash(passwordHash, password);
    if (!validPassword) {
        return {
            result: false,
            message: 'Invalid email and password combination'
        };
    }
    throttler.reset(user.id);
    const sessionFlags: SessionFlags = {
        twoFactorVerified: false
    };
    const sessionToken = generateSessionToken();
    const session = await createSession(
        sessionToken,
        user.id,
        sessionFlags,
        clientIP || '',
        userAgent || '',
        rememberMe
    );
    setSessionTokenCookie(sessionToken, session.expiresAt, rememberMe);

    if (!user.emailVerified) {
        return redirect('/merchant/verify-email');
    }
    if (!user.registered2FA) {
        return redirect('/merchant/twofactor/setup');
    }
    return redirect('/merchant/twofactor');
};

export const verifyEmailAction = async (
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
    await invalidateUserPasswordResetSessions(user.id);
    await updateUserEmailAndSetEmailAsVerified(
        user.id,
        verificationRequest.email
    );
    await deleteEmailVerificationRequestCookie();
    if (!user.registered2FA) {
        return redirect('/merchant/twofactor/setup');
    }
    return redirect('/merchant');
};

export const resendEmailVerificationCodeAction =
    async (): Promise<ActionResult> => {
        const { session, user } = await getCurrentSession();
        if (session === null) {
            return { result: false, message: 'Not authenticated' };
        }
        if (user.registered2FA && !session.twoFactorVerified) {
            return { result: false, message: 'Forbidden' };
        }
        if (!sendVerificationEmailBucket.check(user.id, 1)) {
            return { result: false, message: 'Too many requests' };
        }
        let verificationRequest =
            await getUserEmailVerificationRequestFromRequest();
        if (verificationRequest === null) {
            if (user.emailVerified) {
                return { result: false, message: 'Forbidden' };
            }
            if (!sendVerificationEmailBucket.consume(user.id, 1)) {
                return { result: false, message: 'Too many requests' };
            }
            verificationRequest = await createEmailVerificationRequest(
                user.id,
                user.email
            );
        } else {
            if (!sendVerificationEmailBucket.consume(user.id, 1)) {
                return { result: false, message: 'Too many requests' };
            }
            verificationRequest = await createEmailVerificationRequest(
                user.id,
                verificationRequest.email
            );
        }
        await sendVerificationEmail({
            email: verificationRequest.email,
            code: verificationRequest.code
        });
        await setEmailVerificationRequestCookie(verificationRequest);
        return { result: true, message: 'A new code was sent to your inbox.' };
    };

export const setupTwoFactorAction = async (
    values: z.infer<typeof TwoFactorSetupSchema>
): Promise<ActionResult> => {
    if (!(await globalPOSTRateLimit())) {
        return { result: false, message: 'Too many requests' };
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return { result: false, message: 'Not authenticated' };
    }
    if (!user.emailVerified) {
        return { result: false, message: 'Forbidden' };
    }
    if (user.registered2FA && !session.twoFactorVerified) {
        return { result: false, message: 'Forbidden' };
    }
    if (!totpUpdateBucket.check(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }

    const validatedFields = TwoFactorSetupSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Please enter a valid code' };
    }

    const { code, encodedKey } = validatedFields.data;

    let key: Uint8Array;
    try {
        key = decodeBase64(encodedKey);
    } catch {
        return { result: false, message: 'Invalid key' };
    }
    if (key.byteLength !== 20) {
        return { result: false, message: 'Invalid key' };
    }
    if (!totpUpdateBucket.consume(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }
    if (!verifyTOTPWithGracePeriod(key, 30, 6, code, 60)) {
        return { result: false, message: 'Invalid code' };
    }
    await updateUserTOTPKey(session.userId, key);
    await setSessionAs2FAVerified(session.id);
    return { result: true, message: 'Two factor successfully set up' };
};

export const verifyTwoFactorAction = async (
    values: z.infer<typeof TwoFactorVerficationSchema>
): Promise<ActionResult> => {
    if (!(await globalPOSTRateLimit())) {
        return { result: false, message: 'Too many requests' };
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return { result: false, message: 'Not authenticated' };
    }
    if (
        !user.emailVerified ||
        !user.registered2FA ||
        session.twoFactorVerified
    ) {
        return { result: false, message: 'Forbidden' };
    }
    if (!totpBucket.check(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }

    const validatedFields = TwoFactorVerficationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { result: false, message: 'Please enter a valid code' };
    }

    const { code } = validatedFields.data;
    if (!totpBucket.consume(user.id, 1)) {
        return { result: false, message: 'Too many requests' };
    }
    const totpKey = await getUserTOTPKey(user.id);
    if (totpKey === null) {
        return { result: false, message: 'Forbidden' };
    }
    if (!verifyTOTPWithGracePeriod(totpKey, 30, 6, code, 60)) {
        return { result: false, message: 'Invalid code' };
    }
    totpBucket.reset(user.id);
    await setSessionAs2FAVerified(session.id);
    return redirect('/merchant');
};
