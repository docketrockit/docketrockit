import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

const AdminDashboardMainPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) redirect('/merchant/login');
    return <div>page</div>;
};
export default AdminDashboardMainPage;
