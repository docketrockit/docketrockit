'use client';

import { DownloadIcon } from '@radix-ui/react-icons';
import { type Table } from '@tanstack/react-table';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from './CreateUserDialog';
import { MerchantUser } from '@/types/merchant/user';

interface UsersTableToolbarActionsProps {
    table: Table<MerchantUser>;
}

export const UsersTableToolbarActions = ({
    table
}: UsersTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            <CreateUserDialog />
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: 'users',
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
