import { prisma } from '@/lib/prisma';
import type {
    User,
    EmailChangeRecord,
    RateLimit,
    AuditLog,
    PhoneChangeRecord,
    Prisma
} from '@/generated/prisma';

export type { User, EmailChangeRecord, PhoneChangeRecord, RateLimit, AuditLog };

export type CreateEmailChangeRecordInput = {
    userId: string;
    email: string;
    newEmail: string;
    otp: string;
    expiresAt: Date;
};

export type CreatePhoneChangeRecordInput = {
    userId: string;
    phoneNumber: string;
    newPhoneNumber: string;
    otp: string;
    expiresAt: Date;
};

export const db = {
    users: {
        findById: async (id: string): Promise<User | null> => {
            return await prisma.user.findUnique({
                where: { id }
            });
        },

        findByEmail: async (email: string): Promise<User | null> => {
            return await prisma.user.findUnique({
                where: { email }
            });
        },

        updateEmail: async (
            userId: string,
            newEmail: string
        ): Promise<User | null> => {
            try {
                return await prisma.user.update({
                    where: { id: userId },
                    data: { email: newEmail }
                });
            } catch (error) {
                console.error('Error updating user email:', error);
                return null;
            }
        },

        findByPhoneNumber: async (
            phoneNumber: string
        ): Promise<User | null> => {
            return await prisma.user.findFirst({
                where: { phoneNumber }
            });
        },

        updatePhoneNumber: async (
            userId: string,
            newPhoneNumber: string
        ): Promise<User | null> => {
            try {
                return await prisma.user.update({
                    where: { id: userId },
                    data: { phoneNumber: newPhoneNumber }
                });
            } catch (error) {
                console.error('Error updating user phone number:', error);
                return null;
            }
        }
    },

    emailChangeRecords: {
        create: async (
            data: CreateEmailChangeRecordInput
        ): Promise<EmailChangeRecord> => {
            return await prisma.emailChangeRecord.create({
                data
            });
        },

        findValid: async (
            userId: string,
            newEmail: string
        ): Promise<EmailChangeRecord | null> => {
            return await prisma.emailChangeRecord.findFirst({
                where: {
                    userId,
                    newEmail,
                    expiresAt: {
                        gt: new Date()
                    },
                    attempts: {
                        lt: 3
                    }
                }
            });
        },

        incrementAttempts: async (id: string): Promise<EmailChangeRecord> => {
            return await prisma.emailChangeRecord.update({
                where: { id },
                data: {
                    attempts: {
                        increment: 1
                    }
                }
            });
        },

        deleteByUserId: async (userId: string): Promise<void> => {
            await prisma.emailChangeRecord.deleteMany({
                where: { userId }
            });
        },

        cleanup: async (): Promise<void> => {
            await prisma.emailChangeRecord.deleteMany({
                where: {
                    expiresAt: {
                        lte: new Date()
                    }
                }
            });
        }
    },

    phoneChangeRecords: {
        create: async (
            data: CreatePhoneChangeRecordInput
        ): Promise<PhoneChangeRecord> => {
            return await prisma.phoneChangeRecord.create({
                data
            });
        },

        findValid: async (
            userId: string,
            newPhoneNumber: string
        ): Promise<PhoneChangeRecord | null> => {
            return await prisma.phoneChangeRecord.findFirst({
                where: {
                    userId,
                    newPhoneNumber,
                    expiresAt: {
                        gt: new Date()
                    },
                    attempts: {
                        lt: 3
                    }
                }
            });
        },

        incrementAttempts: async (id: string): Promise<PhoneChangeRecord> => {
            return await prisma.phoneChangeRecord.update({
                where: { id },
                data: {
                    attempts: {
                        increment: 1
                    }
                }
            });
        },

        deleteByUserId: async (userId: string): Promise<void> => {
            await prisma.phoneChangeRecord.deleteMany({
                where: { userId }
            });
        },

        cleanup: async (): Promise<void> => {
            await prisma.phoneChangeRecord.deleteMany({
                where: {
                    expiresAt: {
                        lte: new Date()
                    }
                }
            });
        }
    },

    rateLimits: {
        get: async (key: string): Promise<RateLimit | null> => {
            const record = await prisma.rateLimit.findUnique({
                where: { key }
            });

            if (record && record.resetTime <= new Date()) {
                // Reset expired rate limit
                return await prisma.rateLimit.update({
                    where: { key },
                    data: {
                        count: 0,
                        resetTime: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
                    }
                });
            }

            return record;
        },

        increment: async (key: string): Promise<RateLimit> => {
            return await prisma.rateLimit.upsert({
                where: { key },
                update: {
                    count: {
                        increment: 1
                    }
                },
                create: {
                    key,
                    count: 1,
                    resetTime: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
                }
            });
        },

        cleanup: async (): Promise<void> => {
            await prisma.rateLimit.deleteMany({
                where: {
                    resetTime: {
                        lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
                    }
                }
            });
        }
    }
};
