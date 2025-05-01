import { redirect } from 'next/navigation';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import EditBrandForm from '@/components/brands/edit/EditBrandForm';
import { authCheck } from '@/lib/authCheck';
import { ParamsSlug } from '@/types/global';
import {
    getAllCountries,
    getCountryByName,
    getStatesByCountry,
    getCountryById,
    getStateById
} from '@/data/location';
import { getBrand } from '@/actions/brands';

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { data: brand } = await getBrand(slug);
    if (!brand) {
        return;
    }
    const title = `Edit Brand | ${brand.name}`;
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const EditBrandPage = async (props: { params: ParamsSlug }) => {
    const { slug } = await props.params;
    await authCheck();
    const { data } = await getBrand(slug);
    if (!data) redirect('/admin/merchants');

    const countries = await getAllCountries();
    const defaultCountry = await getCountryByName('Australia');
    if (!defaultCountry) return redirect('/admin/brands/');
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
            <PageBreadcrumb pageTitle="Edit Brand" />
            <EditBrandForm
                brand={data}
                countries={countries!}
                states={states!}
                countryProp={country || defaultCountry}
                stateProp={state || undefined}
            />
        </div>
    );
};
export default EditBrandPage;
