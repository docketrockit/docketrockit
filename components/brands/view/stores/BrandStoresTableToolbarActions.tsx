'use client';

import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { AdminRole, MerchantRole } from '@prisma/client';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { BrandStoresTableToolbarActionsProps } from '@/types/brandStore';
import { Import } from 'lucide-react';

export const BrandStoresTableToolbarActions = ({
    table,
    user,
    slug
}: BrandStoresTableToolbarActionsProps) => {
    let addUrl = `/admin/stores/add?brand=${slug}`;
    let importUrl = '/admin/stores/import';

    if (user.merchantUser) {
        addUrl = `/merchant/stores/add?brand=${slug}`;
        importUrl = '/merchant/stores/import';
    }
    let hasAccess = false;

    if (user.adminUser) {
        hasAccess = [AdminRole.ADMIN, AdminRole.SALES].some((role) =>
            user.adminUser?.adminRole.includes(role)
        );
    }

    if (user.merchantUser) {
        hasAccess = [MerchantRole.ADMIN].some((role) =>
            user.merchantUser?.merchantRole.includes(role)
        );
    }

    return (
        <div className="flex items-center gap-2">
            {hasAccess && (
                <>
                    <Link href={importUrl}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                        >
                            <Import
                                className="mr-2 size-4"
                                aria-hidden="true"
                            />
                            Import stores
                        </Button>
                    </Link>
                    <Link href={addUrl}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                        >
                            <PlusIcon
                                className="mr-2 size-4"
                                aria-hidden="true"
                            />
                            New store
                        </Button>
                    </Link>
                </>
            )}
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: 'brandstores',
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
