'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData> {
    columns: any[];
    data: TData[];
    total: number;
    pages: number;
    currentPage: number;
    pageSize: number;
}

export function DataTable<TData>({
    columns,
    data,
    total,
    pages,
    currentPage,
    pageSize
}: DataTableProps<TData>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const updateParams = (updates: Record<string, string>) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                params.set(key, value);
            });
            router.push(`?${params.toString()}`);
        });
    };

    const handleSort = (columnId: string) => {
        const currentSortBy = searchParams.get('sortBy');
        const currentSortOrder = searchParams.get('sortOrder') || 'desc';

        let newSortOrder = 'desc';
        if (currentSortBy === columnId) {
            newSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
        }

        updateParams({
            sortBy: columnId,
            sortOrder: newSortOrder
        });
    };

    const getSortIcon = (columnId: string) => {
        const currentSortBy = searchParams.get('sortBy');
        const currentSortOrder = searchParams.get('sortOrder') || 'desc';

        if (currentSortBy !== columnId) {
            return <ArrowUpDown className="h-4 w-4" />;
        }

        return currentSortOrder === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
        ) : (
            <ArrowUp className="h-4 w-4" />
        );
    };

    const pageSizeOptions = [
        { value: '10', label: '10' },
        { value: '20', label: '20' },
        { value: '50', label: '50' },
        { value: '100', label: '100' },
        { value: 'all', label: 'All' }
    ];

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    className={cn(column.className)}
                                >
                                    {column.sortable ? (
                                        <Button
                                            variant="ghost"
                                            onClick={() =>
                                                handleSort(column.id)
                                            }
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            {column.header}
                                            {getSortIcon(column.id)}
                                        </Button>
                                    ) : (
                                        column.header
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length ? (
                            data.map((row, index) => (
                                <TableRow key={index}>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            className={cn(column.className)}
                                        >
                                            {column.cell
                                                ? column.cell(row)
                                                : (row as any)[column.id]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                        Showing{' '}
                        {pageSize === -1
                            ? total
                            : Math.min(
                                  (currentPage - 1) * pageSize + 1,
                                  total
                              )}{' '}
                        to{' '}
                        {pageSize === -1
                            ? total
                            : Math.min(currentPage * pageSize, total)}{' '}
                        of {total} results
                    </p>
                </div>

                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={
                                pageSize === -1 ? 'all' : pageSize.toString()
                            }
                            onValueChange={(value) =>
                                updateParams({ limit: value, page: '1' })
                            }
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {pageSizeOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {pageSize !== -1 && (
                        <>
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Page {currentPage} of {pages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
                                    onClick={() => updateParams({ page: '1' })}
                                    disabled={currentPage === 1 || isPending}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0 bg-transparent"
                                    onClick={() =>
                                        updateParams({
                                            page: (currentPage - 1).toString()
                                        })
                                    }
                                    disabled={currentPage === 1 || isPending}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0 bg-transparent"
                                    onClick={() =>
                                        updateParams({
                                            page: (currentPage + 1).toString()
                                        })
                                    }
                                    disabled={
                                        currentPage === pages || isPending
                                    }
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
                                    onClick={() =>
                                        updateParams({ page: pages.toString() })
                                    }
                                    disabled={
                                        currentPage === pages || isPending
                                    }
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
