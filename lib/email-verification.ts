import { encodeBase32 } from '@oslojs/encoding';
import { cookies } from 'next/headers';

import { generateRandomOTP } from './utils';
import db from './db';
import { ExpiringTokenBucket } from './rate-limit';
import { getCurrentSession } from './session';

export interface EmailVerificationRequest {
    id: string;
    userId: string;
    code: string;
    email: string;
    expiresAt: Date;
}

export const getUserEmailVerificationRequest = async (
    userId: string,
    id: string
): Promise<EmailVerificationRequest | null> => {
    const row = await db.emailVerificationRequest.findFirst({
        where: { id, userId },
        select: {
            id: true,
            userId: true,
            code: true,
            email: true,
            expiresAt: true
        }
    });
    if (!row) return null;
    const request: EmailVerificationRequest = {
        id: row.id,
        userId: row.userId,
        code: row.code,
        email: row.email,
        expiresAt: new Date(row.expiresAt * 1000)
    };
    return request;
};

export const deleteUserEmailVerificationRequest = async (
    userId: string
): Promise<void> => {
    await db.emailVerificationRequest.delete({ where: { userId } });
};

export const createEmailVerificationRequest = async (
    userId: string,
    email: string
): Promise<EmailVerificationRequest> => {
    deleteUserEmailVerificationRequest(userId);
    const idBytes = new Uint8Array(20);
    crypto.getRandomValues(idBytes);
    const id = encodeBase32(idBytes).toLowerCase();

    const code = generateRandomOTP();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
    await db.emailVerificationRequest.create({
        data: {
            id,
            userId,
            code,
            email,
            expiresAt: Math.floor(expiresAt.getTime() / 1000)
        }
    });

    const request: EmailVerificationRequest = {
        id,
        userId,
        code,
        email,
        expiresAt
    };
    return request;
};

export const setEmailVerificationRequestCookie = async (
    request: EmailVerificationRequest
): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set('email_verification', request.id, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: request.expiresAt
    });
};

export const deleteEmailVerificationRequestCookie = async (): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set('email_verification', '', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0
    });
};

export const getUserEmailVerificationRequestFromRequest =
    async (): Promise<EmailVerificationRequest | null> => {
        const { user } = await getCurrentSession();
        if (user === null) return null;
        const cookieStore = await cookies();
        const id = cookieStore.get('email_verification')?.value ?? null;
        if (id === null) {
            return null;
        }
        const request = getUserEmailVerificationRequest(user.id, id);
        if (request === null) {
            deleteEmailVerificationRequestCookie();
        }
        return request;
    };

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(
    3,
    60 * 10
);
