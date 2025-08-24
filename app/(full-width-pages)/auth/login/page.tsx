import { Metadata } from 'next';

import { isLoggedIn } from '@/lib/authCheck';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Login',
    description: 'DocketRockit | Merchant Admin | Login'
};

const LoginPage = async () => {
    await isLoggedIn();
    return <LoginForm />;
};

export default LoginPage;
