import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { authCheckMerchant } from '@/lib/authCheck';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { SearchParams } from '@/types/global';
import { UsersTable } from '@/components/merchantDashboard/users/listing/UsersTable';
import { UsersTableProvider } from '@/components/merchantDashboard/users/listing/UsersTableProviders';
import { DateRangePicker } from '@/components/datatable/DateRangePicker';
import { DataTableSkeleton } from '@/components/datatable/DataTableSkeleton';
import { merchantUsersSearchParamsSchema } from '@/schemas/merchant/users';
import { getMerchantUsers } from '@/actions/merchant/users';

export async function generateMetadata() {
    const title = 'Merchant Users';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const MerchantUsersPage = async (props: { searchParams: SearchParams }) => {
    const { user } = await authCheckMerchant(['ADMIN']);
    const searchParams = await props.searchParams;

    let search = merchantUsersSearchParamsSchema.parse(searchParams);

    search = { ...search, merchantId: user.merchantUser?.merchantId };

    const merchantUsersPromise = getMerchantUsers(search);

    return (
        <div>
            <PageBreadcrumb
                pageTitle={`${user.merchantUser?.merchant} Users`}
            />
            <ComponentCard>
                <UsersTableProvider>
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
                        <UsersTable
                            merchantUsersPromise={merchantUsersPromise}
                            user={user}
                        />
                    </Suspense>
                </UsersTableProvider>
            </ComponentCard>
        </div>
    );
};
export default MerchantUsersPage;
