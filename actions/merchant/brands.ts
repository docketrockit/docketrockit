'use server';

import * as z from 'zod';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { type Brand as UserType } from '@/generated/prisma';

import db from '@/lib/db';
import { GetBrandsSchema } from '@/types/merchant/brands';
import { authCheckMerchant } from '@/lib/authCheck';
import { getErrorMessage } from '@/lib/handleError';
import { globalPOSTRateLimit } from '@/lib/request';
import { buildMerchantBrandWhere, buildOrderBy } from '@/lib/brandLib';

export const getBrands = async (input: GetBrandsSchema) => {
    const { user } = await authCheckMerchant();

    if (!user) return { data: [], pageCount: 0 };

    const {
        page,
        per_page,
        sort,
        name,
        tradingAsName,
        primaryContact,
        status,
        operator,
        from,
        to,
        merchantId
    } = input;

    try {
        const offset = (page - 1) * per_page;
        const orderBy = buildOrderBy(sort);

        const fromDay = from ? format(new Date(from), 'yyyy-MM-dd') : undefined;
        const toDay = to ? format(new Date(to), 'yyyy-MM-dd') : undefined;

        const where = buildMerchantBrandWhere({
            operator,
            name,
            tradingAsName,
            primaryContact,
            status,
            from: fromDay,
            to: toDay,
            merchantId
        });

        const data = await db.brand.findMany({
            where,
            include: {
                state: true,
                country: true,
                primaryContact: true,
                merchant: true
            },
            skip: offset,
            take: per_page,
            orderBy
        });

        const total = await db.brand.count({ where });

        const pageCount = Math.ceil(total / per_page);
        return { data, pageCount };
    } catch (err) {
        return { data: [], pageCount: 0 };
    }
};

export const updateBrands = async (input: {
    ids: string[];
    status?: UserType['status'];
}) => {
    const { user } = await authCheckMerchant(['ADMIN']);

    if (!user)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        const data = await db.brand.updateMany({
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
