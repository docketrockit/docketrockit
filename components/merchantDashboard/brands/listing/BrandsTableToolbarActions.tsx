'use client';

import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { MerchantRole } from '@/generated/prisma';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';

import { BrandsTableToolbarActionsProps } from '@/types/merchant/brands';

export const BrandsTableToolbarActions = ({
    table,
    user
}: BrandsTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            {[MerchantRole.ADMIN].some((role) =>
                user.merchantUser?.merchantRole.includes(role)
            ) && (
                <Link href="/merchant/brands/add">
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
                        filename: 'brands',
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
