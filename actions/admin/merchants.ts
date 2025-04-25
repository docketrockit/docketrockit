'use server';

import * as z from 'zod';
import { format, subDays } from 'date-fns';
import { redirect } from 'next/navigation';
import { Merchant } from '@prisma/client';
import GithubSlugger from 'github-slugger';
import { revalidatePath } from 'next/cache';

import db from '@/lib/db';
import { authCheckAdmin } from '@/lib/authCheck';
import { globalPOSTRateLimit } from '@/lib/request';
import { getErrorMessage } from '@/lib/handleError';
import {
    AddMerchantSchemaCreate,
    EditMerchantSchema
} from '@/schemas/admin/merchants';
import { GetMerchantsSchema } from '@/types/merchant';
import { buildMerchantWhere, buildOrderBy } from '@/lib/merchantLib';

const slugger = new GithubSlugger();

export const createMerchant = async (
    values: z.infer<typeof AddMerchantSchemaCreate>
) => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

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
        const validatedFields = AddMerchantSchemaCreate.safeParse(values);

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

    redirect(`/merchant/merchants/${data.slug}`);
};

export const updateMerchant = async ({
    id,
    values
}: {
    id: string;
    values: z.infer<typeof EditMerchantSchema>;
}) => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

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
        const validatedFields = EditMerchantSchema.safeParse(values);

        if (!validatedFields.success) {
            return {
                data: null,
                error: getErrorMessage('Invalid fields')
            };
        }

        const existingMerchant = await db.merchant.findUnique({
            where: { id }
        });

        if (!existingMerchant) {
            return {
                data: null,
                error: getErrorMessage('Invalid merchant id')
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
            acn
        } = validatedFields.data;

        let slug = existingMerchant.slug;

        if (name !== existingMerchant.name) {
            slug = slugger.slug(name);
            let slugExists = true;

            while (slugExists) {
                const checkSlug = await db.merchant.findUnique({
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

        data = await db.merchant.update({
            where: { id },
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

    redirect(`/merchant/merchants/${data.slug}`);
};

export const getMerchants = async (input: GetMerchantsSchema) => {
    const { page, per_page, sort, name, status, operator, from, to } = input;

    try {
        const offset = (page - 1) * per_page;
        const orderBy = buildOrderBy(sort);

        const fromDay = from ? format(new Date(from), 'yyyy-MM-dd') : undefined;
        const toDay = to ? format(new Date(to), 'yyyy-MM-dd') : undefined;

        const where = buildMerchantWhere({
            operator,
            name,
            status,
            from: fromDay,
            to: toDay
        });

        const data = await db.merchant.findMany({
            where,
            include: {
                _count: {
                    select: {
                        brands: true // Counts brands per merchant
                    }
                },
                brands: {
                    select: {
                        id: true,
                        _count: {
                            select: {
                                stores: true // Counts stores per brand
                            }
                        },
                        stores: {
                            select: {
                                id: true,
                                _count: {
                                    select: {
                                        receipts: {
                                            where: {
                                                createdAt: {
                                                    gte: subDays(new Date(), 30)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            skip: offset,
            take: per_page,
            orderBy
        });

        const formatted = data.map((merchant) => {
            const brandCount = merchant._count.brands;

            let storeCount = 0;
            let receiptCount = 0;

            for (const brand of merchant.brands) {
                storeCount += brand._count.stores;

                for (const store of brand.stores) {
                    receiptCount += store._count.receipts;
                }
            }

            const { _count, ...rest } = merchant;

            return {
                ...rest,
                brands: brandCount,
                stores: storeCount,
                receipts: receiptCount
            };
        });

        const total = await db.merchant.count({ where });

        const pageCount = Math.ceil(total / per_page);
        return { data: formatted, pageCount };
    } catch (err) {
        return { data: [], pageCount: 0 };
    }
};

export const updateMerchants = async (input: {
    ids: string[];
    status?: Merchant['status'];
}) => {
    const { user } = await authCheckAdmin(['ADMIN']);

    if (!user)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        await db.merchant.updateMany({
            where: { id: { in: input.ids } },
            data: { status: input.status }
        });

        revalidatePath('/merchant/merchants');

        return {
            data: null,
            error: null
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err)
        };
    }
};

export const getMerchant = async (slug: string) => {
    const { user } = await authCheckAdmin();

    if (!user)
        return {
            data: null
        };
    const data = await db.merchant.findUnique({
        where: {
            slug
        },
        include: {
            state: true,
            country: true
        }
    });

    return { data };
};

export const getMerchantPrimaryContact = async (merchantId: string) => {
    const { user } = await authCheckAdmin();
    if (!user)
        return {
            data: null
        };

    const data = await db.user.findFirst({
        where: { merchantUser: { merchantId, primaryContact: true } },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
        }
    });

    return { data };
};
