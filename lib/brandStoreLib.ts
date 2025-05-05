import { Prisma, Store } from '@prisma/client';
import { filterColumn } from './filterColumn';
import { BrandStoresFilterInput } from '@/types/brandStore';

export const buildBrandStoreWhere = (
    input: BrandStoresFilterInput
): Prisma.StoreWhereInput => {
    const { operator, name, country, state, status, from, to, brandId } = input;

    const whereFilter: Prisma.StoreWhereInput[] = [];

    if (name) {
        whereFilter.push(filterColumn({ column: 'name', value: name }));
    }

    if (country) {
        whereFilter.push(filterColumn({ column: 'countryId', value: country }));
    }

    if (state) {
        whereFilter.push(filterColumn({ column: 'stateId', value: state }));
    }

    if (brandId) {
        whereFilter.push(filterColumn({ column: 'brandId', value: brandId }));
    }

    if (status) {
        whereFilter.push(
            filterColumn({
                column: 'status',
                value: status,
                isSelectable: true
            })
        );
    }

    if (from) {
        whereFilter.push({ createdAt: { gte: new Date(from) } });
    }

    if (to) {
        whereFilter.push({ createdAt: { lte: new Date(to) } });
    }

    const storeFilter =
        operator === 'or' && whereFilter.length > 0
            ? { OR: whereFilter }
            : { AND: whereFilter };

    return { ...storeFilter };
};

const userSortable: (keyof Store)[] = [
    'name',
    'status',
    'createdAt',
    'updatedAt'
];

type SortInput = string | undefined;

/**
 * Builds a Prisma-compatible orderBy clause from a dot-notated string like 'firstName.asc' or 'adminUser.jobTitle.desc'
 */
export function buildOrderBy(
    sort: SortInput
): Prisma.StoreOrderByWithRelationInput {
    const [columnPath, direction] = (sort?.split('.').filter(Boolean) ?? [
        'name',
        'asc'
    ]) as [string, 'asc' | 'desc'];

    // Top-level User field
    if (userSortable.includes(columnPath as keyof Store)) {
        return {
            [columnPath]: direction
        };
    }

    // Default fallback (safety)
    return { name: 'asc' };
}
