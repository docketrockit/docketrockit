import { Prisma, User, MerchantUser } from '@prisma/client';
import { filterColumn } from './filterColumn';
import { BrandUsersFilterInput } from '@/types/brandUser';

export const buildBrandUserWhere = (
    input: BrandUsersFilterInput
): Prisma.UserWhereInput => {
    const {
        operator,
        firstName,
        lastName,
        email,
        jobTitle,
        merchantRole,
        primaryContact,
        status,
        from,
        to,
        brandId
    } = input;

    const whereFilter: Prisma.UserWhereInput[] = [];
    const merchantWhereFilter: Prisma.MerchantUserWhereInput[] = [];

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
        merchantWhereFilter.push(
            filterColumn({ column: 'jobTitle', value: jobTitle })
        );
    }

    if (primaryContact) {
        merchantWhereFilter.push(
            filterColumn({ column: 'primaryContact', value: primaryContact })
        );
    }

    if (merchantRole) {
        merchantWhereFilter.push(
            filterColumn({
                column: 'merchantRole',
                value: merchantRole,
                isSelectable: true
            })
        );
    }

    if (brandId) {
        merchantWhereFilter.push({ brands: { some: { id: brandId } } });
    }

    const userFilter =
        operator === 'or' && whereFilter.length > 0
            ? { OR: whereFilter }
            : { AND: whereFilter };

    const hasMerchantUser =
        merchantWhereFilter.length > 0
            ? {
                  NOT: { merchantUser: null },
                  merchantUser:
                      operator === 'or'
                          ? { OR: merchantWhereFilter }
                          : { AND: merchantWhereFilter }
              }
            : {
                  NOT: { merchantUser: null }
              };

    return {
        ...userFilter,
        ...hasMerchantUser
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

const merchantUserSortable: (keyof MerchantUser)[] = [
    'jobTitle',
    'merchantRole'
];

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

    if (columnPath.includes('.')) {
        const [relation, field] = columnPath.split('.') as [
            'merchantUser',
            keyof MerchantUser
        ];

        if (
            relation === 'merchantUser' &&
            merchantUserSortable.includes(field)
        ) {
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
