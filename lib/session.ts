import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase
} from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { cookies } from 'next/headers';
import { cache } from 'react';

import db from './db';
import type { User } from './user';

export interface SessionFlags {
    twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
    id: string;
    expiresAt: Date;
    userId: string;
    ipAddress: string;
    userAgent: string;
}

type SessionValidationResult =
    | { session: Session; user: User }
    | { session: null; user: null };

export const validateSessionToken = async (
    token: string
): Promise<SessionValidationResult> => {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    const row = await db.session.findUnique({
        where: { id: sessionId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    emailVerified: true,
                    totpKey: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                    role: true,
                    adminUser: true,
                    merchantUser: { include: { merchant: true, brand: true } },
                    consumerUser: true
                }
            }
        }
    });

    if (!row) return { session: null, user: null };

    const session: Session = {
        id: row.id,
        userId: row.userId,
        expiresAt: new Date(row.expiresAt * 1000),
        twoFactorVerified: Boolean(row.twoFactorVerified),
        ipAddress: row.ipAddress || '',
        userAgent: row.userAgent || ''
    };
    const user: User = {
        id: row.user.id,
        email: row.user.email,
        emailVerified: Boolean(row.user.emailVerified),
        registered2FA: Boolean(row.user.totpKey !== null),
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        role: row.user.role
    };

    if (row.user.adminUser) {
        user.adminUser = {
            jobTitle: row.user.adminUser.jobTitle || undefined,
            phoneNumber: row.user.adminUser.phoneNumber || undefined
        };
    }

    if (row.user.merchantUser) {
        user.merchantUser = {
            jobTitle: row.user.merchantUser.jobTitle,
            phoneNumber: row.user.merchantUser.phoneNumber,
            primaryContact: row.user.merchantUser.primaryContact,
            merchant: row.user.merchantUser.merchant.name,
            merchantId: row.user.merchantUser.merchantId,
            brand: row.user.merchantUser.brand.name,
            brandId: row.user.merchantUser.brandId
        };
    }

    if (row.user.consumerUser) {
        user.consumerUser = {
            barcode: row.user.consumerUser.barcode,
            gender: row.user.consumerUser.gender,
            dateOfBirth: row.user.consumerUser.dateOfBirth,
            phoneNumber: row.user.consumerUser.phoneNumber || undefined
        };
    }

    if (Date.now() >= session.expiresAt.getTime()) {
        await db.session.deleteMany({ where: { id: session.id } });
        return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db.session.update({
            where: { id: session.id },
            data: {
                expiresAt: Math.floor(session.expiresAt.getTime() / 1000)
            }
        });
    }
    return { session, user };
};

export const getCurrentSession = cache(
    async (): Promise<SessionValidationResult> => {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value ?? null;
        if (token === null) {
            return { session: null, user: null };
        }
        const result = validateSessionToken(token);
        return result;
    }
);

export const invalidateSession = async (sessionId: string): Promise<void> => {
    await db.session.deleteMany({ where: { id: sessionId } });
};

export const invalidateUserSessions = async (userId: string): Promise<void> => {
    await db.session.deleteMany({ where: { id: userId } });
};

export const setSessionTokenCookie = async (
    token: string,
    expiresAt: Date,
    rememberMe: boolean
): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: rememberMe ? expiresAt : undefined
    });
};

export const deleteSessionTokenCookie = async (): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set('session', '', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0
    });
};

export function generateSessionToken(): string {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
    return token;
}

export const createSession = async (
    token: string,
    userId: string,
    flags: SessionFlags,
    ipAddress: string,
    userAgent: string,
    rememberMe: boolean
): Promise<Session> => {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    const expiresAt = rememberMe
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
        : new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day (or session-based)
    const session: Session = {
        id: sessionId,
        userId,
        expiresAt,
        twoFactorVerified: flags.twoFactorVerified,
        ipAddress,
        userAgent
    };
    await db.session.create({
        data: {
            id: session.id,
            userId: session.userId,
            expiresAt: Math.floor(session.expiresAt.getTime() / 1000),
            twoFactorVerified: session.twoFactorVerified,
            ipAddress,
            userAgent
        }
    });
    return session;
};

export const setSessionAs2FAVerified = async (
    sessionId: string
): Promise<void> => {
    await db.session.update({
        where: { id: sessionId },
        data: { twoFactorVerified: true }
    });
};
