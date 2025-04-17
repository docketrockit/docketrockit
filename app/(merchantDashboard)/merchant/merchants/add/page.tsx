import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AddMerchantForm from '@/components/merchants/AddMerchantForm';
import { authCheck } from '@/lib/authCheck';
import getCountryIDByCode from '@/utils/getCountryIDByCode';

export async function generateMetadata() {
    const title = 'Add Merchant';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AddAdminUserPage = async () => {
    const { session, user } = await authCheck();
    const country = await getCountryIDByCode('AU');
    return (
        <div>
            <PageBreadcrumb pageTitle="Add Merchant" />
            <AddMerchantForm country={country} />
        </div>
    );
};
export default AddAdminUserPage;
