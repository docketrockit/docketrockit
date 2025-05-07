import { redirect } from 'next/navigation';

import { authCheckAdmin } from '@/lib/authCheck';
import { ParamsBrand } from '@/types/global';
import BrandMain from '@/components/brands/view/BrandMain';
import { brandUsersSearchParamsSchema } from '@/schemas/admin/brandUsers';
import { brandStoresSearchParamsSchema } from '@/schemas/admin/brandStores';
import { SearchParams } from '@/types/global';
import { getBrand } from '@/actions/brands';
import { getBrandUsers } from '@/actions/admin/brandUsers';
import { getBrandStores } from '@/actions/admin/brandStores';

export async function generateMetadata({
    params
}: {
    params: Promise<{ brandSlug: string }>;
}) {
    const { brandSlug } = await params;
    const { data: brand } = await getBrand(brandSlug);
    if (!brand) {
        return;
    }
    const title = `View Brand | ${brand.name}`;
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const BrandDetailsPage = async (props: {
    params: ParamsBrand;
    searchParams: SearchParams;
}) => {
    const { slug, brandSlug } = await props.params;
    const { user } = await authCheckAdmin();
    const { data: brand } = await getBrand(brandSlug);
    if (!brand) redirect(`/admin/merchants/${slug}`);
    let searchUsers = brandUsersSearchParamsSchema.parse(
        await props.searchParams
    );
    let searchBrands = brandStoresSearchParamsSchema.parse(
        await props.searchParams
    );

    searchUsers = { ...searchUsers, brandId: brand.id };
    searchBrands = { ...searchBrands, brandId: brand.id };

    const brandUsersPromise = getBrandUsers(searchUsers);
    const brandStoresPromise = getBrandStores(searchBrands);

    return (
        <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                    Brand
                </h3>
                <div className="space-y-6">
                    <BrandMain
                        brand={brand}
                        user={user}
                        brandUsersPromise={brandUsersPromise}
                        brandStoresPromise={brandStoresPromise}
                    />
                </div>
            </div>
        </div>
    );
};

export default BrandDetailsPage;
