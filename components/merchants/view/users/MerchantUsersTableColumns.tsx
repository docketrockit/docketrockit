'use client';

import { useState } from 'react';
import { DotsHorizontalIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import { MerchantRole } from '@prisma/client';
import parsePhoneNumber from 'libphonenumber-js';

import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';

import { getStatusIcon } from '@/lib/utils';
import { UpdateMerchantUserSheet } from './UpdateMerchantUserSheet';
import UserResetPasswordDialog from './UserResetPasswordDialog';
import UserResetTwoFactorDialog from './UserResetTwoFactorDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { MerchantUser } from '@/types/merchantUsers';
import { User } from '@/lib/user';

export const getColumns = ({
    merchantId,
    merchantSlug,
    user
}: {
    merchantId: string;
    merchantSlug: string;
    user: User;
}): ColumnDef<MerchantUser>[] => {
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
            accessorKey: 'firstName',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[31.25rem] truncate font-medium">
                            {`${row.original.firstName} ${row.original.lastName}`}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[31.25rem] truncate font-medium">
                            {row.original.email}
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
            accessorKey: 'primaryContact',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Primary Contact?"
                />
            ),
            cell: ({ row }) => {
                if (row.original.merchantUser?.primaryContact) {
                    return (
                        <div className="flex w-[6.25rem] items-center">
                            <CheckCircledIcon
                                className="mr-2 size-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </div>
                    );
                }
            }
        },
        {
            accessorKey: 'jobTitle',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Job Title" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[31.25rem] truncate font-medium">
                            {row.original.merchantUser?.jobTitle}
                        </span>
                    </div>
                );
            }
        },
        {
            id: 'merchantRole',
            accessorFn: (row) => row.merchantUser?.merchantRole ?? [],
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Access" />
            ),
            cell: ({ row }) => {
                const merchantRoles = row.original.merchantUser
                    ?.merchantRole as MerchantRole[];

                if (!merchantRoles || !Array.isArray(merchantRoles))
                    return null;

                return (
                    <>
                        {merchantRoles.map((role) => (
                            <div
                                key={role}
                                className="flex w-[6.25rem] items-center"
                            >
                                <span className="capitalize">{role}</span>
                            </div>
                        ))}
                    </>
                );
            },
            // filterFn: (row, id, value) => {
            //     return Array.isArray(value) && value.includes(row.getValue(id));
            // }
            filterFn: (row, columnId, filterValue: string[]) => {
                const userRoles = row.original.merchantUser?.merchantRole ?? [];
                const rolesToFilter = Array.isArray(filterValue)
                    ? filterValue
                    : [filterValue];
                return rolesToFilter.some((role) =>
                    userRoles.includes(role as MerchantRole)
                );
                // return filterValue.some((role) =>
                //     userRoles.includes(role as AdminRole)
                // );
            },
            enableColumnFilter: true
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
                      cell: function Cell({ row }: { row: Row<MerchantUser> }) {
                          const [
                              showUpdateAdminUserSheet,
                              setShowUpdateAdminUserSheet
                          ] = useState(false);

                          const {
                              isOpen: isResetPasswordDialogOpen,
                              openDialog: openResetPasswordDialog,
                              setIsOpen: setResetPasswordDialogOpen
                          } = useAlertDialog();
                          const {
                              isOpen: isResetTwoFactorDialogOpen,
                              openDialog: openResetTwoFactorDialog,
                              setIsOpen: setResetTwoFactorDialogOpen
                          } = useAlertDialog();
                          return (
                              <>
                                  <UpdateMerchantUserSheet
                                      open={showUpdateAdminUserSheet}
                                      onOpenChange={setShowUpdateAdminUserSheet}
                                      user={row.original}
                                      merchantId={merchantId}
                                      merchantSlug={merchantSlug}
                                  />
                                  <UserResetPasswordDialog
                                      isOpen={isResetPasswordDialogOpen}
                                      onOpenChange={setResetPasswordDialogOpen}
                                      user={row.original}
                                  />
                                  <UserResetTwoFactorDialog
                                      isOpen={isResetTwoFactorDialogOpen}
                                      onOpenChange={setResetTwoFactorDialogOpen}
                                      user={row.original}
                                  />
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
                                          <DropdownMenuItem
                                              onSelect={() =>
                                                  setShowUpdateAdminUserSheet(
                                                      true
                                                  )
                                              }
                                          >
                                              Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                              onSelect={() =>
                                                  openResetPasswordDialog()
                                              }
                                          >
                                              Reset Password
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                              onSelect={() =>
                                                  openResetTwoFactorDialog()
                                              }
                                          >
                                              Reset Two Factor
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
