import { authCheck } from '@/lib/authCheck';

export async function generateMetadata() {
    const title = 'Dashboard';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AdminDashboardMainPage = async () => {
    const { session, user } = await authCheck();

    return <div>page {user.firstName}</div>;
};
export default AdminDashboardMainPage;
