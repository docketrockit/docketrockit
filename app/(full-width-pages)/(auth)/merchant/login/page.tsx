import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | Login',
    description: 'DocketRockit | Merchant Admin | Login'
};

const LoginPage = async () => {
    // const session = await auth.api.getSession({
    //     headers: await headers()
    // });
    // if (session) redirect('/merchant/');

    return <LoginForm />;
};

export default LoginPage;
