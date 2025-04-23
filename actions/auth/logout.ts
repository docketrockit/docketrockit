'use server';

import { redirect } from 'next/navigation';

import { globalPOSTRateLimit } from '@/lib/request';
import {
    deleteSessionTokenCookie,
    getCurrentSession,
    invalidateSession
} from '@/lib/session';

interface ActionResult {
    message: string;
}

export const logoutAction = async (): Promise<ActionResult> => {
    if (!(await globalPOSTRateLimit())) {
        return {
            message: 'Too many requests'
        };
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return {
            message: 'Not authenticated'
        };
    }
    const urlLocation = user.adminUser ? 'admin' : 'merchant';
    invalidateSession(session.id);
    deleteSessionTokenCookie();
    return redirect(`/${urlLocation}/login`);
};
