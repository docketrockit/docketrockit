'use server';

import * as z from 'zod';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';

import db from '@/lib/db';
import { UserProfileSchema } from '@/schemas/users';
import { globalPOSTRateLimit } from '@/lib/request';
import {
    getCurrentSession,
    invalidateUserSessions,
    deleteSessionTokenCookie,
    createSession,
    generateSessionToken,
    SessionFlags,
    setSessionTokenCookie
} from '@/lib/session';

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

    const headerStore = await headers();
    const clientIP = headerStore.get('X-Forwarded-For');
    const userAgent = headerStore.get('user-agent');

    await invalidateUserSessions(user.id);
    await deleteSessionTokenCookie();
    const sessionFlags: SessionFlags = {
        twoFactorVerified: false
    };
    const sessionToken = generateSessionToken();
    const newSession = await createSession(
        sessionToken,
        user.id,
        sessionFlags,
        clientIP || '',
        userAgent || '',
        session.rememberMe
    );
    setSessionTokenCookie(
        sessionToken,
        newSession.expiresAt,
        session.rememberMe
    );

    return { result: true, message: 'Profile Updated' };
};
