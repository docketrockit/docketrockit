import type {
    User,
    BusinessUserAccess,
    Country,
    Region,
    Status,
    AccessLevel,
    Permission,
    UserRole
} from '@prisma/client';

export type AdminUser = User & {
    businessAccess: (BusinessUserAccess & {
        merchant: { name: string } | null;
        brand: { name: string } | null;
        store: { name: string } | null;
    })[];
    country: Country | null;
    region: Region | null;
};

export type UserWithDetails = User & {
    businessAccess: (BusinessUserAccess & {
        merchant: { name: string; id: string } | null;
        brand: { name: string; id: string } | null;
        store: { name: string; id: string } | null;
    })[];
    country: Country | null;
    region: Region | null;
    createdBy: { name: string; lastName: string } | null;
};

export interface UserFilters {
    search?: string;
    country?: string | 'all';
    status?: Status | 'all';
    permissions?: Permission[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateUserData {
    name: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    countryId?: string;
    regionId?: string;
    role: UserRole[];
    status: Status;
    businessAccess: {
        accessLevel: AccessLevel;
        permissions: Permission[];
        merchantId?: string;
        brandId?: string;
        storeId?: string;
        jobTitle?: string;
    }[];
}

export interface UpdateUserData extends Partial<CreateUserData> {
    id: string;
}

export interface FilterOptions {
    countries: { id: string; name: string }[];
    statuses: Status[];
    permissions: Permission[];
    accessLevels: AccessLevel[];
}
