import { redirect } from 'next/navigation';

import { authCheckMerchant } from '@/lib/authCheck';
import { ParamsSlug } from '@/types/global';
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
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { data: brand } = await getBrand(slug);
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

const MerchantBrandDetailsPage = async (props: {
    params: ParamsSlug;
    searchParams: SearchParams;
}) => {
    const { slug } = await props.params;
    const { user } = await authCheckMerchant();
    const { data: brand } = await getBrand(slug);
    if (!brand) redirect('/merchant/brands');
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

export default MerchantBrandDetailsPage;
