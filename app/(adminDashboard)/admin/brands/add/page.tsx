import { redirect } from 'next/navigation';

import { SearchParams } from '@/types/global';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AddBrandForm from '@/components/brands/add/AddBrandForm';
import { brandFormSchema } from '@/schemas/brands';
import { authCheck } from '@/lib/authCheck';
import {
    getAllCountries,
    getCountryByName,
    getStatesByCountry,
    getCountryById
} from '@/data/location';
import { getAllMerchants } from '@/actions/admin/merchants';

export async function generateMetadata() {
    const title = 'Add Brand';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AddBrandPage = async (props: { searchParams: SearchParams }) => {
    await authCheck();
    const searchParams = await props.searchParams;
    const queryString = brandFormSchema.parse(searchParams);
    const countries = await getAllCountries();
    const defaultCountry = await getCountryByName('Australia');
    if (!defaultCountry) return redirect('/admin/brands/');
    const states = await getStatesByCountry(defaultCountry.id);
    const country = await getCountryById(defaultCountry.id);
    const { data } = await getAllMerchants();

    console.log(queryString.merchant);
    return (
        <div>
            <PageBreadcrumb pageTitle="Add Brand" />
            <AddBrandForm
                countryProp={country || defaultCountry!}
                countries={countries!}
                states={states!}
                merchantSlug={queryString.merchant}
                merchants={data || []}
            />
        </div>
    );
};
export default AddBrandPage;
