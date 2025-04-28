'use client';
'use memo';

import { use, useMemo } from 'react';

import { type DataTableFilterField } from '@/types/data-table';
import { statusLabels } from '@/types/global';

import { useDataTable } from '@/hooks/useDataTable';
import { DataTableAdvancedToolbar } from '@/components/datatable/advanced/DataTableAdvancedToolbar';
import { DataTable } from '@/components/datatable/DataTable';
import { DataTableToolbar } from '@/components/datatable/DataTableToolbar';

import { getStatusIcon } from '@/lib/utils';
import { getColumns } from './MerchantBrandsTableColumns';
import { MerchantBrandsTableFloatingBar } from './MerchantBrandsTableFloatingBar';
import { useMerchantBrandsTable } from './MerchantBrandsTableProviders';
import { MerchantBrandsTableToolbarActions } from './MerchantBrandsTableToolbarActions';
import { MerchantBrandsTableProps, MerchantBrand } from '@/types/merchantBrand';

export const MerchantBrandsTable = ({
    merchantBrandsPromise,
    user
}: MerchantBrandsTableProps) => {
    // Feature flags for showcasing some additional features. Feel free to remove them.
    const { featureFlags } = useMerchantBrandsTable();

    const { data, pageCount } = use(merchantBrandsPromise);

    // Memoize the columns so they don't re-render on every render
    const columns = useMemo(
        () =>
            getColumns({
                user
            }),
        []
    );

    /**
     * This component can render either a faceted filter or a search filter based on the `options` prop.
     *
     * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
     *
     * Each `option` object has the following properties:
     * @prop {string} label - The label for the filter option.
     * @prop {string} value - The value for the filter option.
     * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
     * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
     */
    const formatRoleLabel = (role: string) =>
        role
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

    const filterFields: DataTableFilterField<MerchantBrand>[] = [
        {
            label: 'Search Names...',
            value: 'name',
            placeholder: 'Search names...'
        },
        {
            label: 'Search Trading Names...',
            value: 'tradingAsName',
            placeholder: 'Search trading names...'
        },
        {
            label: 'Status',
            value: 'status',
            options: statusLabels.map((status) => ({
                label: status.label,
                value: status.value,
                icon: getStatusIcon(status.value),
                withCount: true
            }))
        }
    ];

    const { table } = useDataTable({
        data,
        columns,
        pageCount,
        /* optional props */
        filterFields,
        enableAdvancedFilter: featureFlags.includes('advancedFilter'),
        initialState: {
            sorting: [{ id: 'name', desc: false }],
            columnPinning: { right: ['actions'] }
        },
        // For remembering the previous row selection on page change
        getRowId: (originalRow, index) => `${originalRow.id}-${index}`

        /* */
    });

    return (
        <DataTable
            table={table}
            floatingBar={
                featureFlags.includes('floatingBar') ? (
                    <MerchantBrandsTableFloatingBar table={table} />
                ) : null
            }
        >
            {featureFlags.includes('advancedFilter') ? (
                <DataTableAdvancedToolbar
                    table={table}
                    filterFields={filterFields}
                >
                    <MerchantBrandsTableToolbarActions
                        table={table}
                        user={user}
                    />
                </DataTableAdvancedToolbar>
            ) : (
                <DataTableToolbar table={table} filterFields={filterFields}>
                    <MerchantBrandsTableToolbarActions
                        table={table}
                        user={user}
                    />
                </DataTableToolbar>
            )}
        </DataTable>
    );
};
