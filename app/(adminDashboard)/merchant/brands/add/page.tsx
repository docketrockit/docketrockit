import { redirect } from 'next/navigation';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AddBrandForm from '@/components/merchantDashboard/brands/add/AddBrandForm';
import { authCheck, authCheckMerchant } from '@/lib/authCheck';
import {
    getAllCountries,
    getCountryByName,
    getStatesByCountry,
    getCountryById
} from '@/data/location';
import { getAllMerchants, getMerchant } from '@/actions/admin/merchants';

export async function generateMetadata() {
    const title = 'Add Brand';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const MerchantAddBrandPage = async () => {
    const { user } = await authCheckMerchant(['ADMIN']);
    if (!user || !user.merchantUser) return redirect('/merchant/brands/');
    const countries = await getAllCountries();
    const defaultCountry = await getCountryByName('Australia');
    if (!defaultCountry) return redirect('/merchant/brands/');
    const states = await getStatesByCountry(defaultCountry.id);
    const country = await getCountryById(defaultCountry.id);

    return (
        <div>
            <PageBreadcrumb pageTitle="Add Brand" />
            <AddBrandForm
                countryProp={country || defaultCountry!}
                countries={countries!}
                states={states!}
                merchantSlug={user.merchantUser.merchantSlug}
            />
        </div>
    );
};
export default MerchantAddBrandPage;
