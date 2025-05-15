'use server';

import * as z from 'zod';
import { redirect } from 'next/navigation';
import { Brand, Merchant } from '@prisma/client';
import GithubSlugger from 'github-slugger';

import db from '@/lib/db';
import { authCheckAdmin, authCheckBoth } from '@/lib/authCheck';
import { globalPOSTRateLimit } from '@/lib/request';
import { getErrorMessage } from '@/lib/handleError';
import { AddBrandSchemaCreate, EditBrandSchema } from '@/schemas/brands';

const slugger = new GithubSlugger();

export const createBrand = async (
    values: z.infer<typeof AddBrandSchemaCreate>
) => {
    const { user: adminUser } = await authCheckBoth(['ADMIN']);

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
    if (adminUser.adminUser) {
        redirect(`/admin/merchants/${merchant.slug}/brands/${data.slug}`);
    }

    redirect('/merchant/brands');
};

export const getBrand = async (slug: string) => {
    const { user } = await authCheckBoth();

    if (!user)
        return {
            data: null
        };
    const data = await db.brand.findUnique({
        where: {
            slug
        },
        include: {
            state: true,
            country: true,
            primaryContact: true,
            merchant: true
        }
    });

    return { data };
};

export const updateBrand = async ({
    id,
    values,
    merchantSlug
}: {
    id: string;
    values: z.infer<typeof EditBrandSchema>;
    merchantSlug: string;
}) => {
    const { user: adminUser } = await authCheckBoth(['ADMIN']);

    if (!adminUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    let data: Brand;

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                data: null,
                error: getErrorMessage('Too many requests')
            };
        }
        const validatedFields = EditBrandSchema.safeParse(values);

        if (!validatedFields.success) {
            return {
                data: null,
                error: getErrorMessage('Invalid fields')
            };
        }

        const existingBrand = await db.brand.findUnique({
            where: { id }
        });

        if (!existingBrand) {
            return {
                data: null,
                error: getErrorMessage('Invalid brand id')
            };
        }

        const {
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
            acn
        } = validatedFields.data;

        let slug = existingBrand.slug;

        if (name !== existingBrand.name) {
            slug = slugger.slug(name);
            let slugExists = true;

            while (slugExists) {
                const checkSlug = await db.brand.findUnique({
                    where: { slug }
                });
                if (!checkSlug) {
                    slugExists = false;
                    break;
                } else {
                    slug = slugger.slug(name);
                }
            }
        }

        data = await db.brand.update({
            where: { id },
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
                acn
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

    if (adminUser.adminUser) {
        redirect(`/admin/merchants/${merchantSlug}/brands/${data.slug}`);
    }

    redirect('/merchant/brands');
};

export const getAllBrands = async (merchantId?: string) => {
    try {
        let where = {};
        if (merchantId) {
            where = { merchantId };
        }
        const data = await db.brand.findMany({
            where,
            select: { id: true, name: true, slug: true }
        });

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err)
        };
    }
};
