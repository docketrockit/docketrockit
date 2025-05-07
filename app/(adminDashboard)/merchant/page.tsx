import { authCheckMerchant } from '@/lib/authCheck';

export async function generateMetadata() {
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
