import { AdminRole } from '@prisma/client';

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
