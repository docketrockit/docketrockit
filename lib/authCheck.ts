import { redirect } from 'next/navigation';

import { User } from '@/lib/user';
import { Session, getCurrentSession } from '@/lib/session';
import { globalGETRateLimit } from '@/lib/request';

interface AuthCheckLayoutReturn {
    result: boolean;
    message?: string;
    session: Session | null;
    user: User | null;
}

interface AuthCheckReturn {
    session: Session;
    user: User;
}

export const authCheckLayout = async (): Promise<AuthCheckLayoutReturn> => {
    if (!(await globalGETRateLimit())) {
        return {
            result: false,
            message: 'Too many requests',
            session: null,
            user: null
        };
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return redirect('/auth/login');
    }
    if (!user.emailVerified) {
        return redirect('/auth/verify-email');
    }
    if (!user.registered2FA) {
        return redirect('/auth/twofactor/setup');
    }
    if (!session.twoFactorVerified) {
        return redirect('/auth/twofactor');
    }
    if (!session) redirect('/auth/login');

    return { result: true, session, user };
};

export const authCheck = async (): Promise<AuthCheckReturn> => {
    const { session, user } = await getCurrentSession();

    if (!session || !user) redirect('/auth/login');

    return { session, user };
};

export const authCheckAdmin = async (
    access: string[] = []
): Promise<AuthCheckReturn> => {
    const { session, user } = await getCurrentSession();

    if (!session || !user) redirect('/auth/login');

    if (!user.role.includes('ADMIN')) redirect('/auth/login');

    if (!user.adminUser) redirect('/auth/login');

    if (access.length !== 0) {
        const hasAccess = user.adminUser.adminRole.some((role) =>
            access.includes(role)
        );

        if (!hasAccess) redirect('/admin');
    }

    return { session, user };
};

export const authCheckMerchant = async (
    access: string[] = []
): Promise<AuthCheckReturn> => {
    const { session, user } = await getCurrentSession();

    if (!session || !user) redirect('/auth/login');

    if (!user.role.includes('MERCHANT')) redirect('/auth/login');

    if (!user.merchantUser) redirect('/auth/login');

    if (access.length !== 0) {
        const hasAccess = user.merchantUser.merchantRole.some((role) =>
            access.includes(role)
        );

        if (!hasAccess) redirect('/merchant');
    }

    return { session, user };
};
