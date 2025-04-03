import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { cookies } from 'next/headers';

import db from './db';
import { generateResetPasswordToken } from './utils';
import type { User } from './user';

export interface PasswordResetSession {
    id: string;
    userId: string;
    email: string;
    expiresAt: Date;
    code: string;
}

export type PasswordResetSessionValidationResult =
    | { session: PasswordResetSession; user: User }
    | { session: null; user: null };

export const createPasswordResetSession = async (
    token: string,
    userId: string,
    email: string
): Promise<PasswordResetSession> => {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    const session: PasswordResetSession = {
        id: sessionId,
        userId,
        email,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10),
        code: generateResetPasswordToken()
    };
    await db.passwordResetSession.create({
        data: {
            id: session.id,
            userId: session.userId,
            email: session.email,
            code: session.code,
            expiresAt: Math.floor(session.expiresAt.getTime() / 1000)
        }
    });
    return session;
};

export const validatePasswordResetSessionToken = async (
    token: string
): Promise<PasswordResetSessionValidationResult> => {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    const row = await db.passwordResetSession.findUnique({
        where: { id: sessionId },
        include: { user: true }
    });

    if (row === null) return { session: null, user: null };

    const session: PasswordResetSession = {
        id: row.id,
        userId: row.userId,
        email: row.email,
        code: row.code,
        expiresAt: new Date(row.expiresAt * 1000)
    };
    const user: User = {
        id: row.user.id,
        email: row.user.email,
        emailVerified: Boolean(row.user.emailVerified),
        registered2FA: Boolean(row.user.totpKey !== null),
        firstName: row.user.firstName,
        lastName: row.user.lastName
    };
    if (Date.now() >= session.expiresAt.getTime()) {
        await db.passwordResetSession.deleteMany({ where: { id: session.id } });
        return { session: null, user: null };
    }
    return { session, user };
};

export const getPasswordResetTokenByToken = async (
    token: string
): Promise<PasswordResetSessionValidationResult> => {
    const row = await db.passwordResetSession.findFirst({
        where: { code: token },
        include: { user: true }
    });

    if (row === null) return { session: null, user: null };

    const session: PasswordResetSession = {
        id: row.id,
        userId: row.userId,
        email: row.email,
        code: row.code,
        expiresAt: new Date(row.expiresAt * 1000)
    };
    const user: User = {
        id: row.user.id,
        email: row.user.email,
        emailVerified: Boolean(row.user.emailVerified),
        registered2FA: Boolean(row.user.totpKey !== null),
        firstName: row.user.firstName,
        lastName: row.user.lastName
    };

    return { session, user };
};

export const invalidateUserPasswordResetSessions = async (
    userId: string
): Promise<void> => {
    await db.passwordResetSession.deleteMany({
        where: { userId }
    });
};

export const validatePasswordResetSessionRequest =
    async (): Promise<PasswordResetSessionValidationResult> => {
        const cookieStore = await cookies();
        const token = cookieStore.get('password_reset_session')?.value ?? null;
        if (token === null) {
            return { session: null, user: null };
        }
        const result = await validatePasswordResetSessionToken(token);
        if (result.session === null) {
            deletePasswordResetSessionTokenCookie();
        }
        return result;
    };

export const setPasswordResetSessionTokenCookie = async (
    token: string,
    expiresAt: Date
): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set('password_reset_session', token, {
        expires: expiresAt,
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production'
    });
};

export const deletePasswordResetSessionTokenCookie =
    async (): Promise<void> => {
        const cookieStore = await cookies();
        cookieStore.set('password_reset_session', '', {
            maxAge: 0,
            sameSite: 'lax',
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production'
        });
    };
