'use client';

import { DownloadIcon } from '@radix-ui/react-icons';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';

import { CreateBrandUserDialog } from './CreateBrandUserDialog';
import { BrandUsersTableToolbarActionsProps } from '@/types/brandUser';

export const BrandUsersTableToolbarActions = ({
    table,
    brand
}: BrandUsersTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            <CreateBrandUserDialog
                brandId={brand.id}
                brandSlug={brand.slug}
                merchantId={brand.merchant.id}
                merchantSlug={brand.merchant.slug}
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: 'brandusers',
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
