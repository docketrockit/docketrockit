import { Suspense } from 'react';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminUsersFilters } from './AdminUsersFilters';
import type { FilterOptions } from '@/types/adminUser';

interface AdminUsersContentProps {
    filterOptions: FilterOptions;
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
    onEditUser?: (userId: string) => void;
}

export default function AdminUsersContent({
    filterOptions,
    searchParams,
    onEditUser
}: AdminUsersContentProps) {
    console.log('[v0] AdminUsersContent searchParams:', searchParams);

    return (
        <div className="space-y-6">
            <AdminUsersFilters filterOptions={filterOptions} />

            <Suspense fallback={<div>Loading users...</div>}>
                <AdminUsersTable
                    searchParams={searchParams}
                    onEditUser={onEditUser}
                />
            </Suspense>
        </div>
    );
}
