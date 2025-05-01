import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { globalGETRateLimit } from '@/lib/request';
import { getCurrentSession } from '@/lib/session';
import TwoFactorRecoveryCodeForm from '@/components/auth/TwoFactorRecoveryCodeForm';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Recovery Code',
    description: 'DocketRockit | Merchant Admin | Recovery Code'
};

const RecoveryCodePage = async () => {
    if (!(await globalGETRateLimit())) {
        return 'Too many requests';
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
    if (session.twoFactorVerified) {
        if (user.role.includes('ADMIN')) {
            return redirect('/admin');
        } else {
            return redirect('/merchant');
        }
    }
    return <TwoFactorRecoveryCodeForm />;
};
export default RecoveryCodePage;
