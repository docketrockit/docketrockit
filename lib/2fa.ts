import db from './db';
import { decryptToString, encryptString } from './encryption';
import { ExpiringTokenBucket } from './rate-limit';
import { generateRandomRecoveryCode } from './utils';

export const totpBucket = new ExpiringTokenBucket<number>(5, 60 * 30);
export const recoveryCodeBucket = new ExpiringTokenBucket<number>(3, 60 * 60);

export const resetUser2FAWithRecoveryCode = async (
    userId: string,
    recoveryCode: string
): Promise<boolean> => {
    try {
        // Note: In Postgres and MySQL, these queries should be done in a transaction using SELECT FOR UPDATE
        const row = await db.user.findUnique({
            where: { id: userId },
            select: { recoveryCode: true }
        });
        if (!row) return false;
        const userRecoveryCode = decryptToString(row.recoveryCode);
        if (recoveryCode !== userRecoveryCode) {
            return false;
        }

        const newRecoveryCode = generateRandomRecoveryCode();
        const encryptedNewRecoveryCode = encryptString(newRecoveryCode);
        await db.session.update({
            where: { userId },
            data: { twoFactorVerified: false }
        });
        // Compare old recovery code to ensure recovery code wasn't updated.
        const result = await db.user.updateMany({
            where: { id: userId, recoveryCode: row.recoveryCode },
            data: { recoveryCode: encryptedNewRecoveryCode, totpKey: null }
        });
        return result.count > 0;
    } catch (error) {
        return false;
    }
};
