import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export async function generateMetadata() {
    const title = 'Dashboard';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AdminDashboardMainPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) redirect('/merchant/login');
    return <div>page</div>;
};
export default AdminDashboardMainPage;
