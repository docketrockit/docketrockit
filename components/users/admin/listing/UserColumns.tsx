'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    formatPermissions,
    formatStatus,
    getStatusColor
} from '@/utils/format';
import type { AdminUser } from '@/types/adminUser';
import Link from 'next/link';

interface UserColumnsProps {
    onEditUser?: (user: AdminUser) => void;
}

export const createColumns = (onEditUser?: (user: AdminUser) => void) => [
    {
        id: 'name',
        header: 'Name',
        sortable: true,
        cell: (user: AdminUser) => (
            <div className="font-medium">
                {user.name} {user.lastName}
            </div>
        )
    },
    {
        id: 'email',
        header: 'Email',
        sortable: true,
        cell: (user: AdminUser) => (
            <div className="text-sm text-muted-foreground">{user.email}</div>
        )
    },
    {
        id: 'phoneNumber',
        header: 'Phone',
        sortable: false,
        cell: (user: AdminUser) => (
            <div className="text-sm">{user.phoneNumber || '—'}</div>
        )
    },
    {
        id: 'permissions',
        header: 'Permissions',
        sortable: false,
        cell: (user: AdminUser) => {
            const allPermissions = user.businessAccess.flatMap(
                (access) => access.permissions
            );
            const uniquePermissions = Array.from(new Set(allPermissions));
            return (
                <div className="text-sm">
                    {formatPermissions(uniquePermissions)}
                </div>
            );
        }
    },
    {
        id: 'status',
        header: 'Status',
        sortable: true,
        cell: (user: AdminUser) => (
            <Badge variant="outline" className={getStatusColor(user.status)}>
                {formatStatus(user.status)}
            </Badge>
        )
    },
    {
        id: 'location',
        header: 'Location',
        sortable: false,
        cell: (user: AdminUser) => (
            <div className="text-sm">
                {user.country?.name || '—'}
                {user.region && `, ${user.region.name}`}
            </div>
        )
    },
    {
        id: 'actions',
        header: '',
        sortable: false,
        className: 'w-[50px]',
        cell: (user: AdminUser) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditUser?.(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
];

export const columns = createColumns();
