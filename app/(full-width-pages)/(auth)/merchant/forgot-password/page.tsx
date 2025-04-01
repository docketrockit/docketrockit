import { Metadata } from 'next';

import { globalGETRateLimit } from '@/lib/request';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Forgot Password',
    description: 'DocketRockit | Merchant Admin | Forgot Password'
};

const ForgotPasswordPage = async () => {
    if (!(await globalGETRateLimit())) {
        return 'Too many requests';
    }
    return <ForgotPasswordForm />;
};

export default ForgotPasswordPage;
