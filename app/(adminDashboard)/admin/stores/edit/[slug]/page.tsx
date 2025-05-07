import { redirect } from 'next/navigation';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import EditStoreForm from '@/components/stores/edit/EditStoreForm';
import { authCheck } from '@/lib/authCheck';
import { ParamsSlug } from '@/types/global';
import { getStore } from '@/actions/stores';
import { getAllCurrencies } from '@/actions/currencies';

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { data: store } = await getStore(slug);
    if (!store) {
        return;
    }
    const title = `Edit Store | ${store.name}`;
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const EditBrandPage = async (props: { params: ParamsSlug }) => {
    const { slug } = await props.params;
    await authCheck();
    const { data } = await getStore(slug);
    if (!data) redirect('/admin/stores');
    const { data: currencies } = await getAllCurrencies();

    return (
        <div>
            <PageBreadcrumb
                pageTitle={`Edit Store - ${data.brand.name} - ${data.name}`}
            />
            <EditStoreForm store={data} currencies={currencies || []} />
        </div>
    );
};
export default EditBrandPage;
