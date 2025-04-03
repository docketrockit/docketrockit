import { redirect } from 'next/navigation';
import { Session } from '@/lib/session';
import { User } from '@/lib/user';

import { getCurrentSession } from '@/lib/session';
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
