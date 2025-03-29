import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AddAdminUserForm from '@/components/users/admin/AddAdminUserForm';

export async function generateMetadata() {
    const title = 'Add Admin User';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AddAdminUserPage = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="Add Admin User" />
            <AddAdminUserForm />
        </div>
    );
};
export default AddAdminUserPage;
