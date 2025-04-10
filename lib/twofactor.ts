import { compare } from 'bcrypt-ts';

import db from './db';
import { ExpiringTokenBucket } from './rate-limit';

export const totpBucket = new ExpiringTokenBucket<string>(5, 60 * 30);
export const recoveryCodeBucket = new ExpiringTokenBucket<string>(3, 60 * 60);

export const resetUser2FAWithRecoveryCode = async ({
    userId,
    recoveryCode
}: {
    userId: string;
    recoveryCode: string;
}): Promise<boolean> => {
    try {
        const row = await db.user.findUnique({
            where: { id: userId },
            select: { recoveryCodes: true }
        });
        if (!row) return false;
        let passed = false;
        let index = -1;

        const recoveryCodes = row.recoveryCodes;

        const parsedCode = recoveryCode.replace(/-/g, '');

        for (const [i, code] of recoveryCodes.entries()) {
            const doMatch = await compare(parsedCode, code);

            if (doMatch) {
                passed = true;
                index = i;
            }
        }

        if (passed) {
            await db.user.update({
                where: { id: userId },
                data: {
                    totpKey: null
                }
            });
            await db.session.updateMany({
                where: { userId },
                data: {
                    twoFactorVerified: false
                }
            });
        } else {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};
