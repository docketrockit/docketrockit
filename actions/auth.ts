'use server';

import db from '@/lib/db';

export const checkResetToken = async (token: string) => {
    const dbToken = await db.verification.findFirst({
        where: { identifier: `reset-password:${token}` }
    });

    if (!dbToken) {
        return { error: 'Token not found' };
    }

    const UTCTime = new Date();

    if (dbToken.expiresAt < UTCTime) {
        return { error: 'Token expired' };
    }

    return { error: null };
};
