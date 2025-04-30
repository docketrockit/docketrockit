'use client';

import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { AdminRole } from '@prisma/client';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';

import { MerchantBrandsTableToolbarActionsProps } from '@/types/merchantBrand';

export const MerchantBrandsTableToolbarActions = ({
    table,
    user,
    slug
}: MerchantBrandsTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            {[AdminRole.ADMIN, AdminRole.SALES].some((role) =>
                user.adminUser?.adminRole.includes(role)
            ) && (
                <Link href={`/admin/brands/add?merchant=${slug}`}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                    >
                        <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                        New brand
                    </Button>
                </Link>
            )}
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: 'merchantbrands',
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
