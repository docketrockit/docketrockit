import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Forgot Password',
    description: 'DocketRockit | Merchant Admin | Forgot Password'
};

const ForgotPasswordPage = () => {
    return <ForgotPasswordForm />;
};

export default ForgotPasswordPage;
