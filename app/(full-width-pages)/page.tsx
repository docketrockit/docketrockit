import { redirect } from 'next/navigation';

import { globalGETRateLimit } from '@/lib/request';
import { getCurrentSession } from '@/lib/session';

const AuthPage = async () => {
    if (!(await globalGETRateLimit())) {
        return 'Too many requests';
    }
    const { session, user } = await getCurrentSession();
    if (session !== null) {
        if (!user.emailVerified) {
            return redirect('/auth/verify-email');
        }
        if (!user.registered2FA) {
            return redirect('/auth/twofactor/setup');
        }
        if (!session.twoFactorVerified) {
            return redirect('/auth/twofactor');
        }
        if (user.role.includes('ADMIN')) {
            return redirect('/admin');
        } else {
            return redirect('/merchant');
        }
    }

    return redirect('/auth/login');
};
export default AuthPage;
