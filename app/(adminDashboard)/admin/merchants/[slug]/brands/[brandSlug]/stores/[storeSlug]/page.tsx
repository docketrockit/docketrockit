import { redirect } from 'next/navigation';

import { authCheckAdmin } from '@/lib/authCheck';
import { ParamsStore } from '@/types/global';
import StoreMain from '@/components/stores/view/StoreMain';
import { getStore } from '@/actions/stores';
import { GoogleMapProvider } from '@/providers/GoogleMapProvider';

export async function generateMetadata({
    params
}: {
    params: Promise<{ storeSlug: string }>;
}) {
    const { storeSlug } = await params;
    const { data: store } = await getStore(storeSlug);
    if (!store) {
        return;
    }
    const title = `View Store | ${store.name}`;
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const BrandDetailsPage = async (props: { params: ParamsStore }) => {
    const { slug, brandSlug, storeSlug } = await props.params;
    const { user } = await authCheckAdmin();
    const { data: store } = await getStore(storeSlug);
    if (!store) redirect(`/admin/merchants/${slug}/brands/${brandSlug}`);

    return (
        <GoogleMapProvider apiKey={process.env.GOOGLE_PLACES_API_KEY!}>
            <div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                        Store
                    </h3>
                    <div className="space-y-6">
                        <StoreMain store={store} user={user} />
                    </div>
                </div>
            </div>
        </GoogleMapProvider>
    );
};

export default BrandDetailsPage;
