import db from './db';
import { decrypt, decryptToString, encrypt, encryptString } from './encryption';
import { hashPassword } from './password';
import { generateRandomRecoveryCode } from './utils';

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    registered2FA: boolean;
    firstName: string;
    lastName: string;
}

export const createUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
): Promise<User> => {
    const passwordHash = await hashPassword(password);
    const recoveryCode = generateRandomRecoveryCode();
    const encryptedRecoveryCode = encryptString(recoveryCode);
    const row = await db.user.create({
        data: {
            email,
            password: passwordHash,
            recoveryCode: encryptedRecoveryCode,
            firstName,
            lastName
        }
    });
    if (!row) {
        throw new Error('Unexpected error');
    }
    const user: User = {
        id: row.id,
        email,
        emailVerified: false,
        registered2FA: false,
        firstName,
        lastName
    };
    return user;
};

export const updateUserPassword = async (
    userId: string,
    password: string
): Promise<void> => {
    const passwordHash = await hashPassword(password);
    await db.user.update({
        where: { id: userId },
        data: { password: passwordHash }
    });
};

export const updateUserEmailAndSetEmailAsVerified = async (
    userId: string,
    email: string
): Promise<void> => {
    await db.user.update({
        where: { id: userId },
        data: { email, emailVerified: true }
    });
};

export const setUserAsEmailVerifiedIfEmailMatches = async (
    userId: string,
    email: string
): Promise<boolean> => {
    const result = await db.user.updateMany({
        where: { id: userId, email },
        data: { emailVerified: true }
    });
    return result.count > 0;
};

export const getUserPasswordHash = async (userId: string): Promise<string> => {
    const row = await db.user.findUnique({
        where: { id: userId },
        select: { password: true }
    });
    if (!row) {
        throw new Error('Invalid user ID');
    }
    return row.password;
};

export const getUserRecoverCode = async (userId: string): Promise<string> => {
    const row = await db.user.findUnique({
        where: { id: userId },
        select: { recoveryCode: true }
    });
    if (!row) {
        throw new Error('Invalid user ID');
    }
    return decryptToString(row.recoveryCode);
};

export const getUserTOTPKey = async (
    userId: string
): Promise<Uint8Array | null> => {
    const row = await db.user.findUnique({
        where: { id: userId },
        select: { totpKey: true }
    });
    if (!row) {
        throw new Error('Invalid user ID');
    }
    const encrypted = row.totpKey;
    if (encrypted === null) {
        return null;
    }
    return decrypt(encrypted);
};

export const updateUserTOTPKey = async (
    userId: string,
    key: Uint8Array
): Promise<void> => {
    const encrypted = encrypt(key);
    await db.user.update({
        where: { id: userId },
        data: { totpKey: encrypted }
    });
};

export const resetUserRecoveryCode = async (
    userId: string
): Promise<string> => {
    const recoveryCode = generateRandomRecoveryCode();
    const encrypted = encryptString(recoveryCode);
    await db.user.update({
        where: { id: userId },
        data: {
            recoveryCode: encrypted
        }
    });
    return recoveryCode;
};

export const getUserFromEmail = async (email: string): Promise<User | null> => {
    const row = await db.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            emailVerified: true,
            totpKey: true,
            firstName: true,
            lastName: true
        }
    });
    if (!row) return null;

    const user: User = {
        id: row.id,
        email: row.email,
        emailVerified: row.emailVerified,
        registered2FA: Boolean(row.totpKey !== null),
        firstName: row.firstName,
        lastName: row.lastName
    };
    return user;
};
