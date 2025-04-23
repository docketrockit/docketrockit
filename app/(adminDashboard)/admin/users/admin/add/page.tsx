import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AddAdminUserForm from '@/components/users/admin/add/AddAdminUserForm';
import { authCheck } from '@/lib/authCheck';

export async function generateMetadata() {
    const title = 'Add Admin User';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AddAdminUserPage = async () => {
    const { session, user } = await authCheck();
    return (
        <div>
            <PageBreadcrumb pageTitle="Add Admin User" />
            <AddAdminUserForm />
        </div>
    );
};
export default AddAdminUserPage;
