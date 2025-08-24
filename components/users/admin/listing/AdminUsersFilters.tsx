'use client';

import type React from 'react';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';
import type { Permission, Status } from '@prisma/client';

interface FilterOptionsProps {
    filterOptions: {
        countries: { id: string; name: string }[];
        statuses: Status[];
        permissions: Permission[];
    };
}

export function AdminUsersFilters({ filterOptions }: FilterOptionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedCountry, setSelectedCountry] = useState(
        searchParams.get('country') || ''
    );
    const [selectedStatus, setSelectedStatus] = useState(
        searchParams.get('status') || ''
    );
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        searchParams.get('permissions')?.split(',').filter(Boolean) || []
    );

    const updateFilters = (
        updates: Record<string, string | string[] | null>
    ) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (
                    value === null ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    params.delete(key);
                } else if (Array.isArray(value)) {
                    params.set(key, value.join(','));
                } else {
                    params.set(key, value);
                }
            });

            // Reset to first page when filters change
            params.set('page', '1');

            router.push(`?${params.toString()}`);
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search });
    };

    const handlePermissionToggle = (permission: string, checked: boolean) => {
        const newPermissions = checked
            ? [...selectedPermissions, permission]
            : selectedPermissions.filter((p) => p !== permission);

        setSelectedPermissions(newPermissions);
        updateFilters({ permissions: newPermissions });
    };

    const clearAllFilters = () => {
        setSearch('');
        setSelectedCountry('');
        setSelectedStatus('');
        setSelectedPermissions([]);
        updateFilters({
            search: null,
            country: null,
            status: null,
            permissions: null
        });
    };

    const hasActiveFilters =
        search ||
        selectedCountry ||
        selectedStatus ||
        selectedPermissions.length > 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </form>

                {/* Country Filter */}
                <Select
                    value={selectedCountry}
                    onValueChange={(value) => {
                        setSelectedCountry(value);
                        updateFilters({ country: value });
                    }}
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {filterOptions.countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                                {country.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={selectedStatus}
                    onValueChange={(value) => {
                        setSelectedStatus(value);
                        updateFilters({ status: value });
                    }}
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {filterOptions.statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.charAt(0) +
                                    status.slice(1).toLowerCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Permissions Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full sm:w-48 bg-transparent"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Permissions
                            {selectedPermissions.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {selectedPermissions.length}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64" align="end">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">
                                Filter by Permissions
                            </h4>
                            {filterOptions.permissions.map((permission) => (
                                <div
                                    key={permission}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={permission}
                                        checked={selectedPermissions.includes(
                                            permission
                                        )}
                                        onCheckedChange={(checked) =>
                                            handlePermissionToggle(
                                                permission,
                                                checked as boolean
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor={permission}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {permission.replace('_', ' ')}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                        Active filters:
                    </span>
                    {search && (
                        <Badge variant="secondary">
                            Search: {search}
                            <button
                                onClick={() => {
                                    setSearch('');
                                    updateFilters({ search: null });
                                }}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {selectedCountry && (
                        <Badge variant="secondary">
                            Country:{' '}
                            {
                                filterOptions.countries.find(
                                    (c) => c.id === selectedCountry
                                )?.name
                            }
                            <button
                                onClick={() => {
                                    setSelectedCountry('');
                                    updateFilters({ country: null });
                                }}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {selectedStatus && (
                        <Badge variant="secondary">
                            Status:{' '}
                            {selectedStatus.charAt(0) +
                                selectedStatus.slice(1).toLowerCase()}
                            <button
                                onClick={() => {
                                    setSelectedStatus('');
                                    updateFilters({ status: null });
                                }}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {selectedPermissions.map((permission) => (
                        <Badge key={permission} variant="secondary">
                            {permission.replace('_', ' ')}
                            <button
                                onClick={() =>
                                    handlePermissionToggle(permission, false)
                                }
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-6 px-2 text-xs"
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}
