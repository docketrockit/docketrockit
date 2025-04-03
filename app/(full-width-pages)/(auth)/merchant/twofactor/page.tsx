import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { globalGETRateLimit } from '@/lib/request';
import { getCurrentSession } from '@/lib/session';
import TwoFactorVerificationForm from '@/components/auth/TwoFactorVerificationForm';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Two Factor Authentication',
    description: 'DocketRockit | Merchant Admin | Two Factor Authentication'
};

const TwoFactorAuthenticationPage = async () => {
    if (!(await globalGETRateLimit())) {
        return 'Too many requests';
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
    if (session.twoFactorVerified) {
        return redirect('/merchant');
    }

    return <TwoFactorVerificationForm />;
};

export default TwoFactorAuthenticationPage;
