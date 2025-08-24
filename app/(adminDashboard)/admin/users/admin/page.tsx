import { Suspense } from 'react';
import { Metadata } from 'next';

import { authCheckAdmin } from '@/lib/authCheck';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { AdminUsersTable } from '@/components/users/admin/listing/AdminUsersTable';
import { AdminUsersFilters } from '@/components/users/admin/listing/AdminUsersFilters';
import { UserManagementWrapper } from '@/components/users/admin/listing/UserManagementWrapper';
import { getFilterOptions } from '@/actions/admin/adminUsers';
import AdminUsersContent from '@/components/users/admin/listing/AdminUsersContent';

export async function generateMetadata(): Promise<Metadata> {
    const title = 'Admin Users';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

interface AdminUsersPageProps {
    searchParams: {
        search?: string;
        country?: string;
        status?: string;
        permissions?: string;
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: string;
    };
}

export default async function AdminUsersPage({
    searchParams
}: AdminUsersPageProps) {
    const filterOptions = await getFilterOptions();

    return (
        <UserManagementWrapper>
            <AdminUsersContent
                filterOptions={filterOptions}
                searchParams={searchParams}
            />
        </UserManagementWrapper>
    );
}
