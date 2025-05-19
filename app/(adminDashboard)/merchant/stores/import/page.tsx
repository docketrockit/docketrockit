import { redirect } from 'next/navigation';

import { SearchParams } from '@/types/global';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { authCheckMerchant } from '@/lib/authCheck';
import { storeFormSchema } from '@/schemas/stores';
import { StoresCsvImporter } from '@/components/csvuploader/csvupload';

export async function generateMetadata() {
    const title = 'Import Stores';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const MerchantImportStoresPage = async (props: {
    searchParams: SearchParams;
}) => {
    const { user } = await authCheckMerchant(['ADMIN']);
    const searchParams = await props.searchParams;
    const queryString = storeFormSchema.parse(searchParams);
    const brand = queryString.brand;
    if (!brand) redirect('/merchant/brands');

    return (
        <div>
            <PageBreadcrumb pageTitle="Import Stores" />
            <StoresCsvImporter
                brand={brand}
                importFields={[
                    { id: '1', name: 'Name', value: 'name', required: true },
                    {
                        id: '2',
                        name: 'Address Line 1',
                        value: 'address1',
                        required: true
                    },
                    {
                        id: '3',
                        name: 'Address Line 2',
                        value: 'address2',
                        required: false
                    },
                    {
                        id: '4',
                        name: 'Suburb',
                        value: 'city',
                        required: true
                    },
                    {
                        id: '5',
                        name: 'State',
                        value: 'region',
                        required: true
                    },
                    {
                        id: '6',
                        name: 'Post Code',
                        value: 'postalCode',
                        required: true
                    },
                    {
                        id: '7',
                        name: 'Country',
                        value: 'country',
                        required: true
                    },
                    { id: '8', name: 'ABN', value: 'abn', required: false },
                    { id: '9', name: 'ACN', value: 'acn', required: false },
                    {
                        id: '10',
                        name: 'Phone Number',
                        value: 'phoneNumber',
                        required: true
                    },
                    {
                        id: '11',
                        name: 'Currency',
                        value: 'currency',
                        required: true
                    }
                ]}
            />
        </div>
    );
};
export default MerchantImportStoresPage;
