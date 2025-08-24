import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';

export const isLoggedIn = async () => {
    const headerList = await headers();

    const session = await auth.api.getSession({
        headers: headerList
    });

    if (session) {
        if (
            !session.user.role.includes('ADMIN') &&
            !session.user.role.includes('MERCHANT')
        )
            return false;

        if (!session.user.emailVerified) return redirect('/auth/verify-email');

        if (!session.user.phoneVerified) return redirect('/auth/verify-phone');

        if (session.user.role.includes('ADMIN')) redirect('/admin');

        if (session.user.role.includes('MERCHANT')) redirect('/merchant');

        return redirect('/');
    }
};

export const authCheck = async (callbackUrl?: string) => {
    const headerList = await headers();

    const session = await auth.api.getSession({
        headers: headerList
    });

    if (!session) {
        if (callbackUrl) {
            return redirect(
                `/auth/login?callbackURL=${encodeURIComponent(callbackUrl)}`
            );
        } else {
            return redirect('/auth/login');
        }
    }

    if (!session.user.emailVerified) return redirect('/auth/verify-email');

    if (!session.user.phoneVerified) return redirect('/auth/verify-phone');

    return session;
};

export const authCheckAdmin = async (callbackUrl?: string) => {
    const headerList = await headers();

    const session = await auth.api.getSession({
        headers: headerList
    });

    if (!session) {
        if (callbackUrl) {
            return redirect(
                `/auth/login?callbackURL=${encodeURIComponent(callbackUrl)}`
            );
        } else {
            return redirect('/auth/login');
        }
    }

    if (!session.user.role.includes('ADMIN')) {
        if (callbackUrl) {
            return redirect(
                `/auth/login?callbackURL=${encodeURIComponent(callbackUrl)}`
            );
        } else {
            return redirect('/auth/login');
        }
    }

    if (!session.user.emailVerified) return redirect('/auth/verify-email');

    if (!session.user.phoneVerified) return redirect('/auth/verify-phone');

    return session;
};

export const authCheckLayout = async () => {
    const headerList = await headers();

    const session = await auth.api.getSession({
        headers: headerList
    });

    if (!session) return redirect('/auth/login');

    if (!session.user.emailVerified) return redirect('/auth/verify-email');

    if (!session.user.phoneVerified) return redirect('/auth/verify-phone');

    return session;
};

export const authCheckServer = async () => {
    const headerList = await headers();

    const session = await auth.api.getSession({
        headers: headerList
    });

    if (!session) return false;

    return session;
};

export const authCheckServerAdmin = async () => {
    const headerList = await headers();

    const session = await auth.api.getSession({
        headers: headerList
    });

    if (!session) return false;

    if (!session.user.role.includes('ADMIN')) return false;

    return session;
};
