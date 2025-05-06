'use server';

import db from '@/lib/db';
import { getErrorMessage } from '@/lib/handleError';

export const getAllCurrencies = async () => {
    try {
        const data = await db.currency.findMany({
            select: { id: true, name: true, code: true, symbolNative: true },
            orderBy: { name: 'asc' }
        });

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err)
        };
    }
};

export const getCurrencyById = async (id: string) => {
    try {
        const data = await db.currency.findUnique({
            where: { id },
            select: { id: true, name: true, code: true, symbolNative: true }
        });

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err)
        };
    }
};

export const getCurrencyByCode = async (code: string) => {
    try {
        const data = await db.currency.findUnique({
            where: { code },
            select: { id: true, name: true, code: true, symbolNative: true }
        });

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err)
        };
    }
};
