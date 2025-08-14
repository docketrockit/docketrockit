import { authCheckMerchant } from '@/lib/authCheck';
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
    const { user } = await authCheckMerchant();

    return <div>page {user.firstName}</div>;
};
export default AdminDashboardMainPage;
