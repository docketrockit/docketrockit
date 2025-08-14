'use client';

import { DownloadIcon } from '@radix-ui/react-icons';
import { type Table } from '@tanstack/react-table';
import { Prisma } from '@/generated/prisma';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';

import { CreateAdminUserDialog } from './CreateAdminUserDialog';

type AdminUser = Prisma.UserGetPayload<{
    include: { adminUser: true };
}>;

interface AdminUsersTableToolbarActionsProps {
    table: Table<AdminUser>;
}

export const AdminUsersTableToolbarActions = ({
    table
}: AdminUsersTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            <CreateAdminUserDialog />
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: 'adminusers',
                        excludeColumns: ['select', 'actions']
                    })
                }
            >
                <DownloadIcon className="mr-2 size-4" aria-hidden="true" />
                Export
            </Button>
            {/**
             * Other actions can be added here.
             * For example, import, view, etc.
             */}
        </div>
    );
};
