'use server';

import { Role, Gender } from '@prisma/client';

import db from './db';
import { decrypt, encrypt } from './encryption';
import { hashPassword } from './password';
import { generateRandomRecoveryCodes } from './utils';

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    registered2FA: boolean;
    firstName: string;
    lastName: string;
    image?: string;
    role: Role[];
    consumerUser?: ConsumerUser;
    merchantUser?: MerchantUser;
    adminUser?: AdminUser;
}

export interface ConsumerUser {
    barcode: string;
    gender: Gender | null;
    dateOfBirth?: Date | null;
    phoneNumber?: string;
}

export interface MerchantUser {
    jobTitle: string;
    phoneNumber: string;
    primaryContact: boolean;
    merchant: string;
    merchantId: string;
    brand: string;
    brandId: string;
}

export interface AdminUser {
    jobTitle?: string;
    phoneNumber?: string;
}

export const createUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: Role
): Promise<User> => {
    const passwordHash = await hashPassword(password);
    const row = await db.user.create({
        data: {
            email,
            password: passwordHash,
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
        lastName,
        role: [role]
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
): Promise<string[]> => {
    const { recoveryCodes, recoveryCodesHashed } =
        await generateRandomRecoveryCodes();
    // const encryptedRecoveryCodes = recoveryCodes.map((code) => {
    //     return encryptString(code);
    // });
    await db.user.update({
        where: { id: userId },
        data: {
            recoveryCodes: recoveryCodesHashed
        }
    });
    return recoveryCodes;
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
            lastName: true,
            image: true,
            role: true,
            adminUser: true,
            merchantUser: { include: { merchant: true, brand: true } },
            consumerUser: true
        }
    });
    if (!row) return null;

    const user: User = {
        id: row.id,
        email: row.email,
        emailVerified: row.emailVerified,
        registered2FA: Boolean(row.totpKey !== null),
        firstName: row.firstName,
        lastName: row.lastName,
        image: row.image || undefined,
        role: row.role
    };

    if (row.adminUser) {
        user.adminUser = {
            jobTitle: row.adminUser.jobTitle || undefined,
            phoneNumber: row.adminUser.phoneNumber || undefined
        };
    }

    if (row.merchantUser) {
        user.merchantUser = {
            jobTitle: row.merchantUser.jobTitle,
            phoneNumber: row.merchantUser.phoneNumber,
            primaryContact: row.merchantUser.primaryContact,
            merchant: row.merchantUser.merchant.name,
            merchantId: row.merchantUser.merchantId,
            brand: row.merchantUser.brand.name,
            brandId: row.merchantUser.brandId
        };
    }

    if (row.consumerUser) {
        user.consumerUser = {
            barcode: row.consumerUser.barcode,
            gender: row.consumerUser.gender,
            dateOfBirth: row.consumerUser.dateOfBirth,
            phoneNumber: row.consumerUser.phoneNumber || undefined
        };
    }

    return user;
};
