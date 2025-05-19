'use server';

import * as z from 'zod';
import { redirect } from 'next/navigation';
import { Brand } from '@prisma/client';
import GithubSlugger from 'github-slugger';

import db from '@/lib/db';
import { Store, RowError } from '@/types/store';
import { authCheckAdmin, authCheckBoth } from '@/lib/authCheck';
import { globalPOSTRateLimit } from '@/lib/request';
import { getErrorMessage } from '@/lib/handleError';
import { AddStoreSchema, EditStoreSchema } from '@/schemas/stores';
import { geocodeAddress } from '@/lib/geocode';
import { validateAddress } from '@/lib/validateAddress';
import { isValidABN, isValidACN } from '@/utils/businessNumberValidation';

const slugger = new GithubSlugger();

export const createStore = async (values: z.infer<typeof AddStoreSchema>) => {
    const { user: adminUser } = await authCheckBoth(['ADMIN']);

    if (!adminUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    let data: Store;
    let brand: Brand | null;

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                data: null,
                error: getErrorMessage('Too many requests')
            };
        }
        const validatedFields = AddStoreSchema.safeParse(values);

        if (!validatedFields.success) {
            return {
                data: null,
                error: getErrorMessage('Invalid fields')
            };
        }

        const {
            brandSlug,
            name,
            phoneNumber,
            address1,
            address2,
            formattedAddress,
            city,
            region,
            postalCode,
            countryCode,
            latitude,
            longitude,
            currencyId,
            abn,
            acn
        } = validatedFields.data;

        brand = await db.brand.findUnique({
            where: { slug: brandSlug }
        });

        if (!brand) {
            return {
                data: null,
                error: getErrorMessage('Invalid fields')
            };
        }

        const countryId = await db.country.findFirst({
            where: { isoCode: countryCode }
        });

        if (!countryId) {
            return {
                data: null,
                error: getErrorMessage('Error with fields')
            };
        }

        let slug = slugger.slug(`${brand.name} ${name}`);
        let slugExists = true;

        while (slugExists) {
            const checkSlug = await db.brand.findUnique({ where: { slug } });
            if (!checkSlug) {
                slugExists = false;
                break;
            } else {
                slug = slugger.slug(`${brand.name} ${name}`);
            }
        }

        data = await db.store.create({
            data: {
                name,
                slug,
                phoneNumber,
                address1,
                address2,
                formattedAddress,
                latitude,
                longitude,
                city,
                region,
                postalCode,
                currencyId,
                countryId: countryId.id,
                abn,
                acn,
                brandId: brand.id
            },
            include: {
                currency: true,
                country: true,
                brand: { include: { merchant: true } }
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
        redirect(
            `/admin/merchants/${data.brand.merchant.slug}/brands/${data.brand.slug}/stores/${data.slug}`
        );
    }

    redirect(`/merchant/brands/${data.brand.slug}/stores/${data.slug}`);
};

export const getStore = async (slug: string) => {
    const { user } = await authCheckAdmin();

    if (!user)
        return {
            data: null
        };
    const data = await db.store.findUnique({
        where: {
            slug
        },
        include: {
            currency: true,
            country: true,
            brand: { include: { merchant: true } }
        }
    });

    return { data };
};

export const updateStore = async ({
    id,
    values
}: {
    id: string;
    values: z.infer<typeof EditStoreSchema>;
}) => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

    if (!adminUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    let data: Store;

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                data: null,
                error: getErrorMessage('Too many requests')
            };
        }
        const validatedFields = EditStoreSchema.safeParse(values);

        if (!validatedFields.success) {
            return {
                data: null,
                error: getErrorMessage('Invalid fields')
            };
        }

        const existingStore = await db.store.findUnique({
            where: { id },
            include: { brand: true }
        });

        if (!existingStore) {
            return {
                data: null,
                error: getErrorMessage('Invalid store id')
            };
        }

        const {
            name,
            phoneNumber,
            address1,
            address2,
            formattedAddress,
            city,
            region,
            postalCode,
            countryCode,
            latitude,
            longitude,
            currencyId,
            abn,
            acn
        } = validatedFields.data;

        let slug = existingStore.slug;

        if (name !== existingStore.name) {
            let slugExists = true;

            while (slugExists) {
                const checkSlug = await db.store.findUnique({
                    where: { slug }
                });
                if (!checkSlug) {
                    slugExists = false;
                    break;
                } else {
                    slug = slugger.slug(`${existingStore.brand.name} ${name}`);
                }
            }
        }

        const countryId = await db.country.findFirst({
            where: { isoCode: countryCode }
        });

        if (!countryId) {
            return {
                data: null,
                error: getErrorMessage('Error with fields')
            };
        }

        data = await db.store.update({
            where: { id },
            data: {
                name,
                slug,
                phoneNumber,
                address1,
                address2,
                formattedAddress,
                latitude,
                longitude,
                city,
                region,
                postalCode,
                currencyId,
                countryId: countryId.id,
                abn,
                acn
            },
            include: {
                currency: true,
                country: true,
                brand: { include: { merchant: true } }
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

    redirect(
        `/admin/merchants/${data.brand.merchant.slug}/brands/${data.brand.slug}/stores/${data.slug}`
    );
};

export const validateRow = async ({
    data,
    brand
}: {
    data: Record<string, string>;
    brand: string;
}) => {
    const errors: RowError[] = [];

    if (data.name) {
        const nameExists = await db.store.findFirst({
            where: { brand: { slug: brand } }
        });

        if (nameExists)
            errors.push({
                field: 'Name',
                error: `Name already exists for brand`
            });
    } else {
        errors.push({ field: 'Name', error: 'Name not found' });
    }

    let address = true;

    if (!data.address1) {
        errors.push({
            field: 'Address Line 1',
            error: 'Address line 1 not found'
        });
        address = false;
    }

    if (!data.city) {
        errors.push({
            field: 'Suburb',
            error: 'Suburb not found'
        });
        address = false;
    }

    if (!data.region) {
        errors.push({
            field: 'State',
            error: 'State not found'
        });
        address = false;
    }

    if (!data.postalCode) {
        errors.push({
            field: 'Post Code',
            error: 'Post Code not found'
        });
        address = false;
    }

    if (!data.country) {
        errors.push({
            field: 'Country',
            error: 'Country not found'
        });
        address = false;
    }

    const countryCode = await db.country.findFirst({
        where: { name: data.country }
    });

    if (!countryCode) {
        errors.push({
            field: 'Country',
            error: 'Invalid country name'
        });
        address = false;
    }

    // if (address) {
    //     try {
    //         const validationResult = await validateAddress({
    //             address1: data.address1,
    //             address2: data.address2,
    //             city: data.city,
    //             region: data.region,
    //             postalCode: data.postalCode,
    //             country: countryCode?.isoCode || 'AU'
    //         });

    //         if (!validationResult.isValid) {
    //             errors.push({
    //                 field: 'Full address',
    //                 error: 'Address could not be validated'
    //             });
    //         }
    //     } catch (err) {
    //         errors.push({
    //             field: 'Address',
    //             error: 'Failed to validate address with Google'
    //         });
    //     }
    // }

    if (data.abn) {
        const validAbn = isValidABN(data.abn);
        if (!validAbn) {
            errors.push({
                field: 'ABN',
                error: 'Invalid ABN'
            });
        }
    }

    if (data.acn) {
        const validAcn = isValidACN(data.acn);
        console.log(validAcn);
        if (!validAcn) {
            errors.push({
                field: 'ACN',
                error: 'Invalid ACN'
            });
        }
    }

    return errors;
};
