import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, openAPI } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { sendPasswordResetEmail } from './mail';

import db from './db';

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql'
    }),
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session expiration is updated)
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({
                email: user.email,
                url
            });
        }
    },
    user: {
        additionalFields: {
            lastName: {
                type: 'string',
                required: true,
                input: true
            }
        }
    },
    account: {
        accountLinking: {
            enabled: true
        }
    },
    plugins: [
        admin({
            defaultRole: 'user',
            adminRoles: ['admin', 'superadmin'],
            impersonationSessionDuration: 60 * 60 * 24 * 7
        }),
        openAPI(),
        nextCookies()
    ]
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
