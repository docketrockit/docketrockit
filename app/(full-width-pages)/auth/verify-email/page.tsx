import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import VerifyEmailForm from '@/components/auth/VerifyEmailForm';
import { getCurrentSession } from '@/lib/session';
import { getUserEmailVerificationRequestFromRequest } from '@/lib/email-verification';
import { globalGETRateLimit } from '@/lib/request';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Verify Email',
    description: 'DocketRockit | Merchant Admin | Verify Email'
};

const VerifyEmailPage = async () => {
    if (!(await globalGETRateLimit())) {
        return 'Too many requests';
    }
    const { user } = await getCurrentSession();
    if (user === null) {
        return redirect('/merchant/login');
    }

    const verificationRequest =
        await getUserEmailVerificationRequestFromRequest();
    if (verificationRequest === null && user.emailVerified) {
        return redirect('/merchant');
    }
    return <VerifyEmailForm email={verificationRequest?.email ?? user.email} />;
};

export default VerifyEmailPage;
