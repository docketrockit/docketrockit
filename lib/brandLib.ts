import { Prisma, Brand } from '@prisma/client';
import { filterColumn } from './filterColumn';
import { MerchantBrandsFilterInput } from '@/types/merchantBrand';

export const buildMerchantBrandWhere = (
    input: MerchantBrandsFilterInput
): Prisma.BrandWhereInput => {
    const { operator, name, tradingAsName, status, from, to, merchantId } =
        input;

    const whereFilter: Prisma.BrandWhereInput[] = [];

    if (name) {
        whereFilter.push(filterColumn({ column: 'name', value: name }));
    }

    if (tradingAsName) {
        whereFilter.push(
            filterColumn({ column: 'tradingAsName', value: tradingAsName })
        );
    }

    if (merchantId) {
        whereFilter.push(
            filterColumn({ column: 'merchantId', value: merchantId })
        );
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

const userSortable: (keyof Brand)[] = [
    'name',
    'tradingAsName',
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
): Prisma.BrandOrderByWithRelationInput {
    const [columnPath, direction] = (sort?.split('.').filter(Boolean) ?? [
        'name',
        'asc'
    ]) as [string, 'asc' | 'desc'];

    // Top-level User field
    if (userSortable.includes(columnPath as keyof Brand)) {
        return {
            [columnPath]: direction
        };
    }

    // Default fallback (safety)
    return { name: 'asc' };
}
