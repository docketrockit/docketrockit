import { checkResetToken } from '@/actions/auth/forgotPassword';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Reset Password',
    description: 'DocketRockit | Merchant Admin | Reset Password'
};

const ResetPasswordPage = async ({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
    const { token } = await searchParams;
    let result = true;
    let error = '';

    if (!token) {
        result = false;
        error = 'No token provided';
    } else {
        const tokenCheck = await checkResetToken(token);
        if (!tokenCheck.result) {
            error = tokenCheck.message;
        }
    }

    return <ResetPasswordForm token={token} tokenError={error} />;
};

export default ResetPasswordPage;
