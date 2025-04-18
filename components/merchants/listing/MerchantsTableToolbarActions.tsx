'use client';

import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';
import { type Table } from '@tanstack/react-table';

import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { getMerchants } from '@/actions/merchants';
import Link from 'next/link';

type GetMerchantsResponse = Awaited<ReturnType<typeof getMerchants>>;
type Merchant = GetMerchantsResponse['data'][number];

interface MerchantsTableToolbarActionsProps {
    table: Table<Merchant>;
}

export const MerchantsTableToolbarActions = ({
    table
}: MerchantsTableToolbarActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            <Link href="/merchant/merchants/add">
                <Button variant="outline" size="sm" className="cursor-pointer">
                    <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                    New merchant
                </Button>
            </Link>
            <Button
                variant="outline"
                className="cursor-pointer"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: 'merchants',
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
