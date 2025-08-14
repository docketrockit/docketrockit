import { AdminRole, MerchantRole, BrandRole } from '@/generated/prisma';

export enum UserRole {
    BUSINESSADMIN = 'Business Admin',
    TECHNICAL = 'Technical',
    PAYMENTS = 'Payments'
}

// For labels
export const AdminRoleLabels: Record<AdminRole, string> = {
    [AdminRole.ADMIN]: 'Admin',
    [AdminRole.SALES]: 'Sales',
    [AdminRole.TECHNICAL]: 'Technical',
    [AdminRole.ACCOUNTS]: 'Accounts'
};

export const MerchantRoleLabels: Record<MerchantRole, string> = {
    [MerchantRole.ADMIN]: 'Admin',
    [MerchantRole.TECHNICAL]: 'Technical',
    [MerchantRole.ACCOUNTS]: 'Accounts'
};

export const BrandRoleLabels: Record<BrandRole, string> = {
    [MerchantRole.ADMIN]: 'Admin',
    [MerchantRole.TECHNICAL]: 'Technical',
    [MerchantRole.ACCOUNTS]: 'Accounts'
};
