import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, openAPI } from 'better-auth/plugins';
import { sendPasswordResetEmail } from './mail';

import db from './db';

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({
                email: user.email,
                url
            });
        }
    },
    plugins: [
        admin({ defaultRole: 'consumer', adminRoles: ['admin', 'superadmin'] }),
        openAPI()
    ]
} satisfies BetterAuthOptions);
