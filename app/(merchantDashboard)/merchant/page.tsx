import { redirect } from 'next/navigation';

import { getCurrentSession } from '@/lib/session';
import { globalGETRateLimit } from '@/lib/request';

export async function generateMetadata() {
    const title = 'Dashboard';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AdminDashboardMainPage = async () => {
    if (!(await globalGETRateLimit())) {
        return 'Too many requests';
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return redirect('/login');
    }
    if (!user.emailVerified) {
        return redirect('/verify-email');
    }
    if (!user.registered2FA) {
        return redirect('/2fa/setup');
    }
    if (!session.twoFactorVerified) {
        return redirect('/2fa');
    }
    if (!session) redirect('/merchant/login');

    return <div>page</div>;
};
export default AdminDashboardMainPage;
