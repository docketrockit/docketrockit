'use server';

import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Merchant } from '@prisma/client';
import GithubSlugger from 'github-slugger';

import db from '@/lib/db';
import { authCheckRole } from '@/lib/authCheck';
import { globalPOSTRateLimit } from '@/lib/request';
import { getErrorMessage } from '@/lib/handleError';
import { MerchantSchemaCreate } from '@/schemas/merchants';

const slugger = new GithubSlugger();

export const createMerchant = async (
    values: z.infer<typeof MerchantSchemaCreate>
) => {
    const { user: adminUser } = await authCheckRole({
        roles: ['ADMIN'],
        access: ['ADMIN']
    });

    if (!adminUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    let data: Merchant;

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                data: null,
                error: getErrorMessage('Too many requests')
            };
        }
        const validatedFields = MerchantSchemaCreate.safeParse(values);

        if (!validatedFields.success) {
            return {
                data: null,
                error: getErrorMessage('Invalid fields')
            };
        }

        const {
            name,
            phoneNumber,
            genericEmail,
            invoiceEmail,
            address1,
            address2,
            suburb,
            state,
            postcode,
            country,
            abn,
            acn,
            logoUrl
        } = validatedFields.data;

        let slug = slugger.slug(name);
        let slugExists = true;

        while (slugExists) {
            const checkSlug = await db.merchant.findUnique({ where: { slug } });
            if (!checkSlug) {
                slugExists = false;
                break;
            } else {
                slug = slugger.slug(name);
            }
        }

        data = await db.merchant.create({
            data: {
                name,
                slug,
                phoneNumber,
                genericEmail,
                invoiceEmail,
                address1,
                address2,
                suburb,
                postcode,
                stateId: state,
                countryId: country,
                abn,
                acn,
                logoUrl
            }
        });

        if (!data) {
            return {
                data: null,
                error: getErrorMessage('Error with fields')
            };
        }
    } catch (error) {
        return {
            data: null,
            error: getErrorMessage(error)
        };
    }

    redirect('/merchant/merchants');
};
