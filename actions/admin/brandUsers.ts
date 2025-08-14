'use server';

import * as z from 'zod';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { type User as UserType } from '@/generated/prisma';

import db from '@/lib/db';
import { authCheckAdmin, authCheckBoth } from '@/lib/authCheck';
import { GetBrandUsersSchema } from '@/types/brandUser';
import { getErrorMessage } from '@/lib/handleError';
import {
    checkBrandEmailAvailability,
    checkEmailAvailability
} from '@/lib/email';
import { globalPOSTRateLimit } from '@/lib/request';
import { createEmailVerificationRequest } from '@/lib/email-verification';
import { verifyPasswordStrength } from '@/lib/password';
import {
    sendCreateAdminUserAccountEmail,
    sendUpdatedUserToAdminEmail
} from '@/lib/mail';
import { createUser, createUserFromUser, User } from '@/lib/user';
import { BrandUserSchema, BrandUserSchemaUpdate } from '@/schemas/users';
import { buildBrandUserWhere, buildOrderBy } from '@/lib/brandUserLib';

export const getBrandUsers = async (input: GetBrandUsersSchema) => {
    const { user } = await authCheckBoth();

    if (!user) return { data: [], pageCount: 0 };

    const {
        page,
        per_page,
        sort,
        firstName,
        lastName,
        jobTitle,
        email,
        merchantRole,
        primaryContact,
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

        const where = buildBrandUserWhere({
            operator,
            firstName,
            lastName,
            email,
            jobTitle,
            merchantRole,
            primaryContact,
            status,
            from: fromDay,
            to: toDay,
            brandId
        });

        const data = await db.user.findMany({
            where,
            include: {
                primaryContactBrand: true,
                merchantUser: { include: { brandUsers: true } }
            },
            skip: offset,
            take: per_page,
            orderBy
        });

        const total = await db.user.count({ where });

        const pageCount = Math.ceil(total / per_page);
        return { data, pageCount };
    } catch (err) {
        return { data: [], pageCount: 0 };
    }
};

export const updateBrandUsers = async (input: {
    ids: string[];
    status?: UserType['status'];
}) => {
    const { user } = await authCheckAdmin(['ADMIN']);

    if (!user)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        const data = await db.user.updateMany({
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

export const createBrandUser = async (
    values: z.infer<typeof BrandUserSchema>,
    page: 'admin' | 'brand',
    merchantId: string,
    merchantSlug: string,
    brandId: string,
    brandSlug: string
) => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

    if (!adminUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                data: null,
                error: getErrorMessage('Too many requests')
            };
        }
        const validatedFields = BrandUserSchema.safeParse(values);

        if (!validatedFields.success) {
            return { data: null, error: getErrorMessage('Invalid fields') };
        }

        const {
            firstName,
            lastName,
            email,
            password,
            jobTitle,
            brandRole,
            primaryContact,
            phoneNumber
        } = validatedFields.data;

        const emailAvailable = await checkBrandEmailAvailability(
            email,
            merchantId
        );

        if (emailAvailable === 'No') {
            return {
                data: null,
                error: 'Email is already used on a merchant account'
            };
        }

        let userId: string;
        let user: User;

        if (emailAvailable === 'New') {
            const strongPassword = await verifyPasswordStrength(password);
            if (!strongPassword) {
                return { data: null, error: getErrorMessage('Weak password') };
            }
            user = await createUser({
                email,
                password,
                firstName,
                lastName,
                role: 'MERCHANT'
            });
            userId = user.id;
            const emailVerificationRequest =
                await createEmailVerificationRequest(user.id, user.email);
            await sendCreateAdminUserAccountEmail({
                email,
                firstName,
                password,
                code: emailVerificationRequest.code
            });
            await db.user.update({
                where: { id: userId },
                data: { phoneNumber }
            });

            await db.merchantUser.create({
                data: {
                    jobTitle,
                    userId,
                    merchantId,
                    brandUsers: {
                        create: [{ brandId, brandRole }]
                    }
                }
            });
        } else {
            if (
                emailAvailable.merchantUser?.brandUsers.some(
                    (brand) => brand.id === brandId
                )
            ) {
                return {
                    data: null,
                    error: getErrorMessage('User already on brand')
                };
            }
            userId = emailAvailable.id;
            user = await createUserFromUser({ user: emailAvailable });

            if (!emailAvailable.role.includes('MERCHANT')) {
                await db.user.update({
                    where: { id: userId },
                    data: {
                        role: { push: 'MERCHANT' }
                    }
                });
            }
            if (!emailAvailable.merchantUser) {
                await db.merchantUser.create({
                    data: {
                        jobTitle,
                        userId,
                        merchantId,
                        brandUsers: {
                            create: [{ brandId, brandRole }]
                        }
                    }
                });
            } else {
                const brandUser = await db.brandUser.create({
                    data: {
                        brandId,
                        merchantUserId: emailAvailable.merchantUser?.id,
                        brandRole
                    }
                });
                await db.merchantUser.update({
                    where: { id: emailAvailable.merchantUser.id },
                    data: { brandUsers: { connect: { id: brandUser.id } } }
                });
            }
            await sendUpdatedUserToAdminEmail({
                email,
                firstName
            });
        }
        if (primaryContact) {
            await db.brand.updateMany({
                where: { id: brandId },
                data: { primaryContactId: userId }
            });
        }

        switch (page) {
            case 'admin':
                revalidatePath('/admin/users/merchant');
                break;
            case 'brand':
                revalidatePath(
                    `/admin/merchants/${merchantSlug}/brands/${brandSlug}`
                );
                break;
            default:
                revalidatePath('/admin/users/merchant');
                break;
        }

        return {
            data: user,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: getErrorMessage(error)
        };
    }
};

export const updateBrandUser = async (
    values: z.infer<typeof BrandUserSchemaUpdate>,
    id: string,
    merchantId: string,
    merchantSlug: string,
    brandUserId: string,
    brandId: string,
    brandSlug: string
) => {
    const { user: adminUser } = await authCheckAdmin(['ADMIN']);

    if (!adminUser)
        return {
            data: null,
            error: getErrorMessage('Unauthorized')
        };

    try {
        if (!(await globalPOSTRateLimit())) {
            return {
                data: null,
                error: getErrorMessage('Too many requests')
            };
        }
        const merchant = await db.merchant.findUnique({
            where: { id: merchantId }
        });
        if (!merchant) {
            return { data: null, error: getErrorMessage('Invalid fields') };
        }
        const brand = await db.brand.findUnique({
            where: { id: brandId }
        });
        if (!brand) {
            return { data: null, error: getErrorMessage('Invalid fields') };
        }
        const validatedFields = BrandUserSchemaUpdate.safeParse(values);

        if (!validatedFields.success) {
            return { data: null, error: getErrorMessage('Invalid fields') };
        }

        const {
            firstName,
            lastName,
            email,
            jobTitle,
            brandRole,
            status,
            primaryContact,
            phoneNumber
        } = validatedFields.data;

        const emailAvailable = checkEmailAvailability(email);
        if (!emailAvailable) {
            return {
                data: null,
                error: getErrorMessage('Email is already used')
            };
        }
        if (primaryContact) {
            await db.brand.updateMany({
                where: { id: brandId },
                data: { primaryContactId: id }
            });
        } else {
            if (id === brand.primaryContactId) {
                await db.merchant.updateMany({
                    where: { id: merchantId },
                    data: { primaryContactId: null }
                });
            }
        }
        await db.user.update({
            where: { id },
            data: {
                firstName,
                lastName,
                email,
                status,
                phoneNumber
            }
        });

        await db.brandUser.update({
            where: { id: brandUserId },
            data: { brandRole }
        });

        revalidatePath(`/admin/merchants/${merchantSlug}/brands/${brandSlug}`);

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
