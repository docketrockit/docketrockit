'use client';

import { DownloadIcon } from '@radix-ui/react-icons';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';

import { CreateMerchantUserDialog } from './CreateMerchantUserDialog';
import { MerchantUsersTableToolbarActionsProps } from '@/types/merchantUsers';

export const MerchantUsersTableToolbarActions = ({
    table,
    merchant
}: MerchantUsersTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            <CreateMerchantUserDialog
                merchantId={merchant.id}
                merchantSlug={merchant.slug}
            />
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
