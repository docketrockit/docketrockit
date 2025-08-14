import { Prisma, Merchant } from '@/generated/prisma';
import { filterColumn } from './filterColumn';
import { MerchantsFilterInput } from '@/types/merchant';

export const buildMerchantWhere = (
    input: MerchantsFilterInput
): Prisma.MerchantWhereInput => {
    const { operator, name, status, from, to } = input;

    const whereFilter: Prisma.MerchantWhereInput[] = [];

    if (name) {
        whereFilter.push(filterColumn({ column: 'name', value: name }));
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

    const merchantFilter =
        operator === 'or' && whereFilter.length > 0
            ? { OR: whereFilter }
            : { AND: whereFilter };

    return { ...merchantFilter };
};

const userSortable: (keyof Merchant)[] = [
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
): Prisma.MerchantOrderByWithRelationInput {
    const [columnPath, direction] = (sort?.split('.').filter(Boolean) ?? [
        'name',
        'asc'
    ]) as [string, 'asc' | 'desc'];

    // Top-level User field
    if (userSortable.includes(columnPath as keyof Merchant)) {
        return {
            [columnPath]: direction
        };
    }

    // Default fallback (safety)
    return { name: 'asc' };
}
