'use client';

import { DotsHorizontalIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import parsePhoneNumber from 'libphonenumber-js';
import Link from 'next/link';

import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';

import { getStatusIcon } from '@/lib/utils';
import { BrandStore } from '@/types/brandStore';
import { User } from '@/lib/user';

export const getColumns = ({
    user
}: {
    user: User;
}): ColumnDef<BrandStore>[] => {
    const hasAccessToActions =
        user.adminUser?.adminRole.includes('ADMIN') ||
        user.adminUser?.adminRole.includes('ACCOUNTS');
    return [
        {
            id: 'select',
            size: 40,
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                    className="translate-y-0.5"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-0.5"
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[31.25rem] truncate font-medium">
                            {row.original.name}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'city',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="City" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[31.25rem] truncate font-medium">
                            {row.original.city}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'region',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="State" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[31.25rem] truncate font-medium">
                            {row.original.region}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'country',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Country" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[31.25rem] truncate font-medium">
                            {row.original.country.name}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'currency',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Currency" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[31.25rem] truncate font-medium">
                            {row.original.currency}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'phoneNumber',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Phone Number" />
            ),
            cell: ({ row }) => {
                if (row.original.phoneNumber) {
                    const phoneNumber = parsePhoneNumber(
                        row.original.phoneNumber
                    );
                    return (
                        <div className="flex space-x-2">
                            <span className="max-w-[31.25rem] truncate font-medium">
                                {phoneNumber?.formatNational()}
                            </span>
                        </div>
                    );
                }
            }
        },

        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const status = row.original.status;

                if (!status) return null;

                const Icon = getStatusIcon(status);

                return (
                    <div className="flex w-[6.25rem] items-center">
                        <Icon
                            className="mr-2 size-4 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <span className="capitalize">{status}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return Array.isArray(value) && value.includes(row.getValue(id));
            }
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created At" />
            ),
            cell: ({ cell }) => formatDate(cell.getValue() as Date)
        },
        ...(hasAccessToActions
            ? [
                  {
                      id: 'actions',
                      cell: function Cell({ row }: { row: Row<BrandStore> }) {
                          return (
                              <>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button
                                              aria-label="Open menu"
                                              variant="ghost"
                                              className="flex size-8 p-0 data-[state=open]:bg-muted"
                                          >
                                              <DotsHorizontalIcon
                                                  className="size-4"
                                                  aria-hidden="true"
                                              />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                          align="end"
                                          className="w-40"
                                      >
                                          <DropdownMenuItem>
                                              <Link
                                                  href={`/admin/merchants/brands/stores/edit/${row.original.slug}`}
                                                  className="cursor-pointer hover:underline"
                                              >
                                                  Edit
                                              </Link>
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </>
                          );
                      },
                      size: 40
                  }
              ]
            : [])
    ];
};
