import { Prisma, Merchant } from '@prisma/client';
import { filterColumn } from './filterColumn';
import { MerchantsFilterInput } from '@/types/merchant';

export const buildMerchantWhere = (
    input: MerchantsFilterInput
): Prisma.MerchantWhereInput => {
    const {
        operator,
        firstName,
        lastName,
        email,
        jobTitle,
        adminRole,
        status,
        from,
        to
    } = input;

    const whereFilter: Prisma.MerchantWhereInput[] = [];

    if (firstName) {
        whereFilter.push(
            filterColumn({ column: 'firstName', value: firstName })
        );
    }

    if (lastName) {
        whereFilter.push(filterColumn({ column: 'lastName', value: lastName }));
    }

    if (email) {
        whereFilter.push(filterColumn({ column: 'email', value: email }));
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

    if (jobTitle) {
        adminWhereFilter.push(
            filterColumn({ column: 'jobTitle', value: jobTitle })
        );
    }

    if (adminRole) {
        adminWhereFilter.push(
            filterColumn({
                column: 'adminRole',
                value: adminRole,
                isSelectable: true
            })
        );
    }

    const userFilter =
        operator === 'or' && whereFilter.length > 0
            ? { OR: whereFilter }
            : { AND: whereFilter };

    const hasAdminUser =
        adminWhereFilter.length > 0
            ? {
                  NOT: { adminUser: null },
                  adminUser:
                      operator === 'or'
                          ? { OR: adminWhereFilter }
                          : { AND: adminWhereFilter }
              }
            : {
                  NOT: { adminUser: null }
              };

    return {
        ...userFilter,
        ...hasAdminUser
    };
};

const userSortable: (keyof User)[] = [
    'firstName',
    'lastName',
    'email',
    'status',
    'createdAt',
    'updatedAt'
];

const adminUserSortable: (keyof AdminUser)[] = ['jobTitle', 'adminRole'];

type SortInput = string | undefined;

/**
 * Builds a Prisma-compatible orderBy clause from a dot-notated string like 'firstName.asc' or 'adminUser.jobTitle.desc'
 */
export function buildOrderBy(
    sort: SortInput
): Prisma.UserOrderByWithRelationInput {
    const [columnPath, direction] = (sort?.split('.').filter(Boolean) ?? [
        'firstName',
        'asc'
    ]) as [string, 'asc' | 'desc'];

    // If it's a relation (e.g. adminUser.jobTitle)
    if (columnPath.includes('.')) {
        const [relation, field] = columnPath.split('.') as [
            'adminUser',
            keyof AdminUser
        ];

        if (relation === 'adminUser' && adminUserSortable.includes(field)) {
            return {
                [relation]: {
                    [field]: direction
                }
            };
        }
    }

    // Top-level User field
    if (userSortable.includes(columnPath as keyof User)) {
        return {
            [columnPath]: direction
        };
    }

    // Default fallback (safety)
    return { firstName: 'asc' };
}
