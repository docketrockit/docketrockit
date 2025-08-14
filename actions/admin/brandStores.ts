'use server';

import { format } from 'date-fns';
import { type Brand as UserType } from '@/generated/prisma';

import db from '@/lib/db';
import { GetBrandStoresSchema } from '@/types/brandStore';
import { authCheckBoth } from '@/lib/authCheck';
import { getErrorMessage } from '@/lib/handleError';
import { buildBrandStoreWhere, buildOrderBy } from '@/lib/brandStoreLib';

export const getBrandStores = async (input: GetBrandStoresSchema) => {
    const { user } = await authCheckBoth();

    if (!user) return { data: [], pageCount: 0 };

    const {
        page,
        per_page,
        sort,
        name,
        country,
        state,
        status,
        operator,
        from,
        to,
        brandId
    } = input;

    try {
        const offset = (page - 1) * per_page;
        const orderBy = buildOrderBy(sort);

        const fromDay = from ? format(new Date(from), 'yyyy-MM-dd') : undefined;
        const toDay = to ? format(new Date(to), 'yyyy-MM-dd') : undefined;

        const where = buildBrandStoreWhere({
            operator,
            name,
            country,
            state,
            status,
            from: fromDay,
            to: toDay,
            brandId
        });

        const data = await db.store.findMany({
            where,
            include: {
                currency: true,
                country: true,
                brand: { include: { merchant: true } }
            },
            skip: offset,
            take: per_page,
            orderBy
        });

        const total = await db.store.count({ where });

        const pageCount = Math.ceil(total / per_page);
        return { data, pageCount };
    } catch (err) {
        return { data: [], pageCount: 0 };
    }
};

export const updateBrandStores = async (input: {
    ids: string[];
    status?: UserType['status'];
}) => {
    const { user } = await authCheckBoth(['ADMIN']);

    if (!user)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        const data = await db.store.updateMany({
            where: { id: { in: input.ids } },
            data: { status: input.status }
        });

        return {
            data,
            error: null
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err)
        };
    }
};
