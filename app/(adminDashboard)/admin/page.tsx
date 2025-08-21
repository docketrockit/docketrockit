import { authCheckAdmin } from '@/lib/authCheck';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const title = 'Dashboard';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AdminDashboardMainPage = async () => {
    const { user } = await authCheckAdmin();

    return <div>page {user.name}</div>;
};
export default AdminDashboardMainPage;
