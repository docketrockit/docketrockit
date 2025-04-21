import { redirect } from 'next/navigation';

import { getMerchant } from '@/actions/merchants';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import EditMerchantForm from '@/components/merchants/edit/EditMerchantForm';
import { authCheck } from '@/lib/authCheck';
import { ParamsSlug } from '@/types/global';
import {
    getAllCountries,
    getCountryByName,
    getStatesByCountry,
    getCountryById,
    getStateById
} from '@/data/location';

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { data: merchant } = await getMerchant(slug);
    if (!merchant) {
        return;
    }
    const title = `Edit Merchant | ${merchant.name}`;
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const EditMerchantPage = async (props: { params: ParamsSlug }) => {
    const { slug } = await props.params;
    await authCheck();
    const { data } = await getMerchant(slug);
    if (!data) redirect('/merchant/merchants');

    const countries = await getAllCountries();
    const defaultCountry = await getCountryByName('Australia');
    if (!defaultCountry) return redirect('/merchant/merchants/');
    const states = data.countryId
        ? await getStatesByCountry(data.countryId)
        : await getStatesByCountry(defaultCountry.id);
    const country = data.countryId
        ? await getCountryById(data.countryId)
        : await getCountryById(defaultCountry.id);
    const state = data.countryId
        ? await getStateById(data.stateId)
        : await getStateById(defaultCountry.id);

    return (
        <div>
            <PageBreadcrumb pageTitle="Add Merchant" />
            <EditMerchantForm
                merchant={data}
                countries={countries!}
                states={states!}
                countryProp={country || defaultCountry}
                stateProp={state || undefined}
            />
        </div>
    );
};
export default EditMerchantPage;
