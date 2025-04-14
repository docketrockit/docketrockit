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
        return redirect('/merchant/login');
    }
    if (!user.emailVerified) {
        return redirect('/merchant/verify-email');
    }
    if (!user.registered2FA) {
        return redirect('/merchant/twofactor/setup');
    }
    if (!session.twoFactorVerified) {
        return redirect('/merchant/twofactor');
    }
    if (!session) redirect('/merchant/login');

    return { result: true, session, user };
};

export const authCheck = async (): Promise<AuthCheckReturn> => {
    const { session, user } = await getCurrentSession();

    if (!session || !user) redirect('/merchant/login');

    return { session, user };
};

export const authCheckRole = async ({
    roles,
    access
}: {
    roles: string[];
    access: string[];
}): Promise<AuthCheckLayoutReturn> => {
    const { session, user } = await getCurrentSession();

    if (!session || !user) return { result: false, session, user };

    const hasRole = user.role.some((role) => roles.includes(role));

    if (!hasRole) return { result: false, session, user };

    let hasAccess = false;

    if (user.adminUser) {
        hasAccess = user.adminUser.adminRole.some((role) =>
            access.includes(role)
        );
    }

    if (user.merchantUser) {
        hasAccess = user.merchantUser.merchantRole.some((role) =>
            access.includes(role)
        );
    }

    if (!hasAccess) return { result: false, session, user };

    return { result: true, session, user };
};
