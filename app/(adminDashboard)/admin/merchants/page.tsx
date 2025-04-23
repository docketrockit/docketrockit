import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { authCheck } from '@/lib/authCheck';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { SearchParams } from '@/types/global';
import { MerchantsTable } from '@/components/merchants/listing/MerchantsTable';
import { MerchantsTableProvider } from '@/components/merchants/listing/MerchantsTableProviders';
import { DateRangePicker } from '@/components/datatable/DateRangePicker';
import { DataTableSkeleton } from '@/components/datatable/DataTableSkeleton';
import { merchantsSearchParamsSchema } from '@/schemas/merchants';
import { getMerchants } from '@/actions/merchants';

export async function generateMetadata() {
    const title = 'Merchants';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const MerchantsPage = async (props: { searchParams: SearchParams }) => {
    const { session, user } = await authCheck();
    const searchParams = await props.searchParams;

    const search = merchantsSearchParamsSchema.parse(searchParams);

    const merchantsPromise = getMerchants(search);

    return (
        <div>
            <PageBreadcrumb pageTitle="Merchants" />
            <ComponentCard>
                <MerchantsTableProvider>
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
                        <MerchantsTable merchantsPromise={merchantsPromise} />
                    </Suspense>
                </MerchantsTableProvider>
            </ComponentCard>
        </div>
    );
};
export default MerchantsPage;
