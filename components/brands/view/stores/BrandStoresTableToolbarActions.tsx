'use client';

import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { AdminRole } from '@prisma/client';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';

import { BrandStoresTableToolbarActionsProps } from '@/types/brandStore';

export const BrandStoresTableToolbarActions = ({
    table,
    user,
    slug
}: BrandStoresTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            {[AdminRole.ADMIN, AdminRole.SALES].some((role) =>
                user.adminUser?.adminRole.includes(role)
            ) && (
                <Link href={`/admin/stores/add?brand=${slug}`}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                    >
                        <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                        New store
                    </Button>
                </Link>
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
