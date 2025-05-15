import { SearchParams } from '@/types/global';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AddStoreForm from '@/components/stores/add/AddStoreForm';
import { storeFormSchema } from '@/schemas/stores';
import { authCheckMerchant } from '@/lib/authCheck';
import { getAllBrands } from '@/actions/brands';
import { getAllCurrencies, getCurrencyByCode } from '@/actions/currencies';

export async function generateMetadata() {
    const title = 'Add Store';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const MerchantAddStorePage = async (props: { searchParams: SearchParams }) => {
    const { user } = await authCheckMerchant(['ADMIN']);
    const searchParams = await props.searchParams;
    const queryString = storeFormSchema.parse(searchParams);
    const { data: brands } = await getAllBrands(user.merchantUser?.merchantId);
    const { data: currencies } = await getAllCurrencies();
    const { data: currency } = await getCurrencyByCode('AUD');

    return (
        <div>
            <PageBreadcrumb pageTitle="Add Store" />
            <AddStoreForm
                brandSlug={queryString.brand}
                brands={brands || []}
                currencies={currencies || []}
                defaultCurrency={currency}
            />
        </div>
    );
};
export default MerchantAddStorePage;
