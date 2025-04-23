import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';
import { getCurrentSession } from '@/lib/session';
import { globalGETRateLimit } from '@/lib/request';
import { checkPasswordUpdate } from '@/lib/password-reset';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Update Password',
    description: 'DocketRockit | Merchant Admin | Update Password'
};

const VerifyEmailPage = async () => {
    if (!(await globalGETRateLimit())) {
        return 'Too many requests';
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return redirect('/auth/login');
    }

    const passwordVerifiedCheck = await checkPasswordUpdate(user.id);
    if (passwordVerifiedCheck) {
        if (user.role.includes('ADMIN')) {
            return redirect('/admin');
        } else {
            return redirect('/merchant');
        }
    }
    return <UpdatePasswordForm />;
};

export default VerifyEmailPage;
