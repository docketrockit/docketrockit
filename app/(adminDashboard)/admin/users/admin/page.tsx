import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { authCheck } from '@/lib/authCheck';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { SearchParams } from '@/types/global';
import { AdminUsersTable } from '@/components/users/admin/listing/AdminUsersTable';
import { AdminUsersTableProvider } from '@/components/users/admin/listing/AdminUsersTableProviders';
import { DateRangePicker } from '@/components/datatable/DateRangePicker';
import { DataTableSkeleton } from '@/components/datatable/DataTableSkeleton';
import { adminUsersSearchParamsSchema } from '@/schemas/adminUsers';
import { getAdminUsers } from '@/actions/adminUsers';

export async function generateMetadata() {
    const title = 'Admin Users';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const AdminUsersPage = async (props: { searchParams: SearchParams }) => {
    const { session, user } = await authCheck();
    const searchParams = await props.searchParams;

    const search = adminUsersSearchParamsSchema.parse(searchParams);

    const adminUsersPromise = getAdminUsers(search);

    return (
        <div>
            <PageBreadcrumb pageTitle="Admin Users" />
            <ComponentCard>
                <AdminUsersTableProvider>
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
                        <AdminUsersTable
                            adminUsersPromise={adminUsersPromise}
                        />
                    </Suspense>
                </AdminUsersTableProvider>
            </ComponentCard>
        </div>
    );
};
export default AdminUsersPage;
