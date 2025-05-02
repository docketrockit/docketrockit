'use server';

import {
    Role,
    Gender,
    AdminRole,
    MerchantRole,
    BrandRole
} from '@prisma/client';

import db from './db';
import { decrypt, encrypt } from './encryption';
import { hashPassword } from './password';
import { generateRandomRecoveryCodes } from './utils';
import { User as PrismaUser } from '@prisma/client';

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    registered2FA: boolean;
    passwordVerified: boolean;
    firstName: string;
    lastName: string;
    image?: string;
    role: Role[];
    phoneNumber?: string;
    consumerUser?: ConsumerUser;
    merchantUser?: MerchantUser;
    adminUser?: AdminUser;
    brandUser?: BrandUser;
}

export interface ConsumerUser {
    barcode: string;
    gender: Gender | null;
    dateOfBirth?: Date | null;
}

export interface MerchantUser {
    jobTitle: string;
    primaryContact: boolean;
    merchant: string;
    merchantId: string;
    brands: BrandUser[];
    merchantRole: MerchantRole[];
}

export interface AdminUser {
    jobTitle?: string;
    adminRole: AdminRole[];
}

export interface BrandUser {
    brandRole: BrandRole[];
    brandId: string;
}

interface CreateUserProps {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
}
export const createUserFromUser = async ({
    user
}: {
    user: PrismaUser;
}): Promise<User> => {
    const createdUser: User = {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        registered2FA: true,
        passwordVerified: user.passwordVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    };
    return createdUser;
};

export const createUser = async ({
    email,
    password,
    firstName,
    lastName,
    role
}: CreateUserProps): Promise<User> => {
    const passwordHash = await hashPassword(password);
    const row = await db.user.create({
        data: {
            email,
            password: passwordHash,
            firstName,
            lastName,
            role: [role]
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
        passwordVerified: false,
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
        data: { password: passwordHash, passwordVerified: true }
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
            passwordVerified: true,
            totpKey: true,
            firstName: true,
            lastName: true,
            image: true,
            role: true,
            adminUser: true,
            phoneNumber: true,
            merchantUser: { include: { merchant: true, brandUsers: true } },
            consumerUser: true
        }
    });
    if (!row) return null;

    const user: User = {
        id: row.id,
        email: row.email,
        emailVerified: row.emailVerified,
        registered2FA: Boolean(row.totpKey !== null),
        passwordVerified: row.passwordVerified,
        firstName: row.firstName,
        lastName: row.lastName,
        image: row.image || undefined,
        phoneNumber: row.phoneNumber || undefined,
        role: row.role
    };

    if (row.adminUser) {
        user.adminUser = {
            jobTitle: row.adminUser.jobTitle || undefined,
            adminRole: row.adminUser.adminRole
        };
    }

    if (row.merchantUser) {
        const brands: BrandUser[] = [];
        if (row.merchantUser.brandUsers.length > 0) {
            row.merchantUser.brandUsers.map((brandUser) => {
                brands.push({
                    brandId: brandUser.brandId,
                    brandRole: brandUser.brandRole
                });
            });
        }
        user.merchantUser = {
            jobTitle: row.merchantUser.jobTitle,
            primaryContact:
                row.merchantUser.merchant.primaryContactId === user.id,
            merchant: row.merchantUser.merchant.name,
            merchantId: row.merchantUser.merchantId,
            brands,
            merchantRole: row.merchantUser.merchantRole
        };
    }

    if (row.consumerUser) {
        user.consumerUser = {
            barcode: row.consumerUser.barcode,
            gender: row.consumerUser.gender,
            dateOfBirth: row.consumerUser.dateOfBirth
        };
    }

    return user;
};
