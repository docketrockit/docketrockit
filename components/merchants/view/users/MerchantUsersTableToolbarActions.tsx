'use client';

import { DownloadIcon } from '@radix-ui/react-icons';
import { type Table } from '@tanstack/react-table';
import { Prisma } from '@prisma/client';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';

import { CreateAdminUserDialog } from './CreateMerchantUserDialog';
import {
    MerchantUsersTableToolbarActionsProps,
    MerchantUser
} from '@/types/merchantUsers';

export const MerchantUsersTableToolbarActions = ({
    table
}: MerchantUsersTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            <CreateAdminUserDialog />
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: 'merchantusers',
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
