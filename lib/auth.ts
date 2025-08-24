import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { UserRole } from '@/generated/prisma';
import { customSession, openAPI } from 'better-auth/plugins';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/argon2';
import { sendVerificationEmail, sendResetEmail } from '@/lib/mail';
import { logPasswordResetRequested } from '@/actions/audit/audit-auth';
import { RoleArraySchema } from '@/schemas/auth';

const options = {
    database: prismaAdapter(prisma, {
        provider: 'postgresql' // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        password: {
            hash: hashPassword,
            verify: verifyPassword
        },
        autoSignIn: false,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
            await sendResetEmail({
                email: user.email,
                link: url,
                name: user.name
            });
        }
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            // const newSession = ctx.context.newSession;
            if (ctx.path === '/forget-password') {
                await logPasswordResetRequested(ctx.body.email);
            }
        })
    },
    advanced: {
        database: {
            generateId: false
        }
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async (
                { user, newEmail, url, token },
                request
            ) => {
                await sendVerificationEmail({ email: newEmail, link: url });
            }
        },
        additionalFields: {
            lastName: {
                type: 'string',
                required: true
            },
            role: {
                type: 'string[]'
            },
            postalCode: {
                type: 'string',
                required: false
            },
            city: {
                type: 'string',
                required: false
            },
            regionId: {
                type: 'string',
                required: false
            },
            countryId: {
                type: 'string',
                required: false
            },
            phoneNumber: {
                type: 'string',
                required: false
            },
            timezone: {
                type: 'string',
                required: false
            },
            locale: {
                type: 'string',
                required: false
            },
            phoneVerified: {
                type: 'boolean',
                required: false
            },
            emailVerified: {
                type: 'boolean',
                required: false
            },
            passwordVerified: {
                type: 'boolean',
                required: false
            }
        }
    },
    session: {
        expiresIn: 30 * 24 * 60 * 60,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    account: {
        accountLinking: {
            enabled: false
        }
    },
    plugins: [nextCookies()]
} satisfies BetterAuthOptions;

export const auth = betterAuth({
    ...options,
    plugins: [
        ...(options.plugins ?? []),
        customSession(async ({ user, session }) => {
            const accounts = await prisma.account.findMany({
                where: { id: user.id }
            });
            const businessUserAccess =
                await prisma.businessUserAccess.findUnique({
                    where: { id: user.id }
                });
            return {
                session,
                user: {
                    ...user,
                    businessUserAccess
                },
                accounts
            };
        }, options),
        openAPI()
    ]
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'UNKNOWN';
