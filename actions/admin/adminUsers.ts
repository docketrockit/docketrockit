'use server';

import { Status, Permission, AccessLevel } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import type {
    UserFilters,
    CreateUserData,
    UpdateUserData,
    AdminUser,
    UserWithDetails
} from '@/types/adminUser';

export async function getAdminUsers(filters: UserFilters = {}) {
    console.log('[v0] getAdminUsers received filters:', filters);

    const {
        search = '',
        country,
        status,
        permissions = [],
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = filters;

    const skip = limit === -1 ? 0 : (page - 1) * limit;
    const take = limit === -1 ? undefined : limit;

    // Build where clause
    const where: any = {
        OR: search
            ? [
                  { name: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } }
              ]
            : undefined,
        countryId: country && country !== 'all' ? country : undefined,
        status:
            status &&
            status !== 'all' &&
            Object.values(Status).includes(status as Status)
                ? status
                : undefined
    };

    // Filter by permissions if specified
    if (permissions.length > 0) {
        where.businessAccess = {
            some: {
                permissions: {
                    hasSome: permissions
                }
            }
        };
    }

    // Remove undefined values
    Object.keys(where).forEach(
        (key) => where[key] === undefined && delete where[key]
    );

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                businessAccess: {
                    include: {
                        merchant: { select: { name: true } },
                        brand: { select: { name: true } },
                        store: { select: { name: true } }
                    }
                },
                country: true,
                region: true
            },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take
        }),
        prisma.user.count({ where })
    ]);

    return {
        users: users as AdminUser[],
        total,
        pages: limit === -1 ? 1 : Math.ceil(total / limit)
    };
}

export async function getUserById(id: string): Promise<UserWithDetails | null> {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            businessAccess: {
                include: {
                    merchant: { select: { name: true, id: true } },
                    brand: { select: { name: true, id: true } },
                    store: { select: { name: true, id: true } }
                }
            },
            country: true,
            region: true,
            createdBy: { select: { name: true, lastName: true } }
        }
    });

    return user as UserWithDetails | null;
}

export async function createUser(data: CreateUserData) {
    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                countryId: data.countryId,
                regionId: data.regionId,
                role: data.role,
                status: data.status,
                businessAccess: {
                    create: data.businessAccess.map((access) => ({
                        accessLevel: access.accessLevel,
                        permissions: access.permissions,
                        merchantId: access.merchantId,
                        brandId: access.brandId,
                        storeId: access.storeId,
                        jobTitle: access.jobTitle
                    }))
                }
            },
            include: {
                businessAccess: {
                    include: {
                        merchant: { select: { name: true } },
                        brand: { select: { name: true } },
                        store: { select: { name: true } }
                    }
                },
                country: true,
                region: true
            }
        });

        revalidatePath('/admin/users');
        return { success: true, user };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error: 'Failed to create user' };
    }
}

export async function updateUser(data: UpdateUserData) {
    try {
        const { id, businessAccess, ...updateData } = data;

        // Update user and handle business access separately
        const user = await prisma.$transaction(async (tx) => {
            // Update basic user data
            const updatedUser = await tx.user.update({
                where: { id },
                data: updateData
            });

            // Update business access if provided
            if (businessAccess) {
                // Delete existing business access
                await tx.businessUserAccess.deleteMany({
                    where: { userId: id }
                });

                // Create new business access
                await tx.businessUserAccess.createMany({
                    data: businessAccess.map((access) => ({
                        userId: id,
                        accessLevel: access.accessLevel,
                        permissions: access.permissions,
                        merchantId: access.merchantId,
                        brandId: access.brandId,
                        storeId: access.storeId,
                        jobTitle: access.jobTitle
                    }))
                });
            }

            return updatedUser;
        });

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${id}`);
        return { success: true, user };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}

export async function getCountries() {
    return await prisma.country.findMany({
        orderBy: { name: 'asc' },
        include: {
            regions: {
                orderBy: { name: 'asc' }
            }
        }
    });
}

export async function getMerchants() {
    return await prisma.merchant.findMany({
        where: { status: 'APPROVED' },
        orderBy: { name: 'asc' },
        include: {
            brands: {
                where: { status: 'APPROVED' },
                orderBy: { name: 'asc' },
                include: {
                    stores: {
                        where: { status: 'APPROVED' },
                        orderBy: { name: 'asc' }
                    }
                }
            }
        }
    });
}

// Helper function to get filter options
export async function getFilterOptions() {
    const [countries, statuses, permissions, accessLevels] = await Promise.all([
        prisma.country.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        }),
        Promise.resolve(Object.values(Status)),
        Promise.resolve(Object.values(Permission)),
        Promise.resolve(Object.values(AccessLevel))
    ]);

    return {
        countries,
        statuses,
        permissions,
        accessLevels
    };
}
