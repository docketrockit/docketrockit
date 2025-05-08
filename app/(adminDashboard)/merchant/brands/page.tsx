import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { authCheckMerchant } from '@/lib/authCheck';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { SearchParams } from '@/types/global';
import { BrandsTable } from '@/components/merchantDashboard/brands/listing/BrandsTable';
import { BrandsTableProvider } from '@/components/merchantDashboard/brands/listing/BrandsTableProviders';
import { DateRangePicker } from '@/components/datatable/DateRangePicker';
import { DataTableSkeleton } from '@/components/datatable/DataTableSkeleton';
import { brandsSearchParamsSchema } from '@/schemas/merchant/brands';
import { getBrands } from '@/actions/merchant/brands';

export async function generateMetadata() {
    const title = 'Brands';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const BrandsPage = async (props: { searchParams: SearchParams }) => {
    const { user } = await authCheckMerchant(['ADMIN']);
    const searchParams = await props.searchParams;

    let search = brandsSearchParamsSchema.parse(searchParams);

    search = { ...search, merchantId: user.merchantUser?.merchantId };

    const brandsPromise = getBrands(search);

    return (
        <div>
            <PageBreadcrumb pageTitle="Brands" />
            <ComponentCard>
                <BrandsTableProvider>
                    <Suspense fallback={<Skeleton className="h-7 w-52" />}>
                        <DateRangePicker
                            triggerSize="sm"
                            triggerClassName="ml-auto w-56 sm:w-60"
                            align="end"
                        />
                    </Suspense>
                    <Suspense
                        fallback={
                            <DataTableSkeleton
                                columnCount={5}
                                searchableColumnCount={1}
                                filterableColumnCount={2}
                                cellWidths={[
                                    '10rem',
                                    '40rem',
                                    '12rem',
                                    '12rem',
                                    '8rem'
                                ]}
                                shrinkZero
                            />
                        }
                    >
                        <BrandsTable
                            brandsPromise={brandsPromise}
                            user={user}
                        />
                    </Suspense>
                </BrandsTableProvider>
            </ComponentCard>
        </div>
    );
};
export default BrandsPage;
