'use server';

import * as z from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Brand, Merchant } from '@prisma/client';
import GithubSlugger from 'github-slugger';

import db from '@/lib/db';
import { authCheckAdmin } from '@/lib/authCheck';
import { globalPOSTRateLimit } from '@/lib/request';
import { getErrorMessage } from '@/lib/handleError';
import { AddBrandSchemaCreate } from '@/schemas/brands';

const slugger = new GithubSlugger();

export const createBrand = async (
    values: z.infer<typeof AddBrandSchemaCreate>
) => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

    if (!adminUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    let data: Brand;
    let merchant: Merchant | null;

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                data: null,
                error: getErrorMessage('Too many requests')
            };
        }
        const validatedFields = AddBrandSchemaCreate.safeParse(values);

        if (!validatedFields.success) {
            return {
                data: null,
                error: getErrorMessage('Invalid fields')
            };
        }

        const {
            merchantSlug,
            name,
            tradingAsName,
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

        merchant = await db.merchant.findUnique({
            where: { slug: merchantSlug }
        });

        if (!merchant) {
            return {
                data: null,
                error: getErrorMessage('Invalid fields')
            };
        }

        let slug = slugger.slug(name);
        let slugExists = true;

        while (slugExists) {
            const checkSlug = await db.brand.findUnique({ where: { slug } });
            if (!checkSlug) {
                slugExists = false;
                break;
            } else {
                slug = slugger.slug(name);
            }
        }

        data = await db.brand.create({
            data: {
                name,
                tradingAsName,
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
                logoUrl,
                merchantId: merchant.id
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

    redirect(`/admin/merchants/${merchant.slug}/brands/${data.slug}`);
};
