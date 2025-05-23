import { redirect } from 'next/navigation';

import { getMerchant } from '@/actions/admin/merchants';
import { authCheckAdmin } from '@/lib/authCheck';
import { ParamsSlug } from '@/types/global';
import MerchantMain from '@/components/merchants/view/MerchantMain';
import { merchantUsersSearchParamsSchema } from '@/schemas/admin/merchantUsers';
import { merchantBrandsSearchParamsSchema } from '@/schemas/admin/merchantBrands';
import { getMerchantUsers } from '@/actions/admin/merchantUsers';
import { SearchParams } from '@/types/global';
import { getMerchantBrands } from '@/actions/admin/merchantBrands';

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
    const title = `View Merchant | ${merchant.name}`;
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const MerchantDetailsPage = async (props: {
    params: ParamsSlug;
    searchParams: SearchParams;
}) => {
    const { slug } = await props.params;
    const { user } = await authCheckAdmin();
    const { data } = await getMerchant(slug);
    if (!data) redirect('/admin/merchants');
    let searchUsers = merchantUsersSearchParamsSchema.parse(
        await props.searchParams
    );
    let searchBrands = merchantBrandsSearchParamsSchema.parse(
        await props.searchParams
    );

    searchUsers = { ...searchUsers, merchantId: data.id };
    searchBrands = { ...searchBrands, merchantId: data.id };

    const merchantUsersPromise = getMerchantUsers(searchUsers);
    const merchantBrandsPromise = getMerchantBrands(searchBrands);

    return (
        <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                    Merchant
                </h3>
                <div className="space-y-6">
                    <MerchantMain
                        merchant={data}
                        merchantUsersPromise={merchantUsersPromise}
                        user={user}
                        merchantBrandsPromise={merchantBrandsPromise}
                    />
                </div>
            </div>
        </div>
    );
};

export default MerchantDetailsPage;
