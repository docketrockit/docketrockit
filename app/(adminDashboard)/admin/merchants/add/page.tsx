import { redirect } from 'next/navigation';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AddMerchantForm from '@/components/merchants/add/AddMerchantForm';
import { authCheck } from '@/lib/authCheck';
import {
    getAllCountries,
    getCountryByName,
    getStatesByCountry,
    getCountryById
} from '@/data/location';

export async function generateMetadata() {
    const title = 'Add Merchant';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AddMerchantPage = async () => {
    await authCheck();
    const countries = await getAllCountries();
    const defaultCountry = await getCountryByName('Australia');
    if (!defaultCountry) return redirect('/admin/merchants/');
    const states = await getStatesByCountry(defaultCountry.id);
    const country = await getCountryById(defaultCountry.id);
    return (
        <div>
            <PageBreadcrumb pageTitle="Add Merchant" />
            <AddMerchantForm
                countryProp={country || defaultCountry!}
                countries={countries!}
                states={states!}
            />
        </div>
    );
};
export default AddMerchantPage;
