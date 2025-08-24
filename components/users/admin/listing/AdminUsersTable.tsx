'use client';

import { useEffect, useState } from 'react';
import type { Permission, Status } from '@prisma/client';

import { getAdminUsers } from '@/actions/admin/adminUsers';
import { DataTable } from '@/components/ui/data-table';
import { createColumns } from '@/components/users/admin/listing/UserColumns';

interface AdminUsersTableProps {
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
    onEditUser?: (user: any) => void;
}

export function AdminUsersTable({
    searchParams,
    onEditUser
}: AdminUsersTableProps) {
    const [data, setData] = useState<{
        users: any[];
        total: number;
        pages: number;
    }>({ users: [], total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const filters = {
                search: searchParams.search,
                country: searchParams.country,
                status: searchParams.status as Status | undefined,
                permissions: searchParams.permissions
                    ?.split(',')
                    .filter(Boolean) as Permission[] | undefined,
                page: Number.parseInt(searchParams.page || '1'),
                limit:
                    searchParams.limit === 'all'
                        ? -1
                        : Number.parseInt(searchParams.limit || '10'),
                sortBy: searchParams.sortBy || 'createdAt',
                sortOrder: (searchParams.sortOrder as 'asc' | 'desc') || 'desc'
            };

            console.log('[v0] AdminUsersTable searchParams:', searchParams);
            console.log('[v0] AdminUsersTable processed filters:', filters);

            const result = await getAdminUsers(filters);

            console.log('[v0] AdminUsersTable server result:', result);
            setData(result);
            setLoading(false);
        }

        fetchData();
    }, [searchParams]);

    const filters = {
        page: Number.parseInt(searchParams.page || '1'),
        limit:
            searchParams.limit === 'all'
                ? -1
                : Number.parseInt(searchParams.limit || '10')
    };

    const columns = createColumns(onEditUser);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                Loading...
            </div>
        );
    }

    return (
        <DataTable
            columns={columns}
            data={data.users}
            total={data.total}
            pages={data.pages}
            currentPage={filters.page}
            pageSize={filters.limit === -1 ? data.total : filters.limit}
        />
    );
}
