import type { Permission, AccessLevel, Status } from '@prisma/client';

export function formatPermissions(permissions: Permission[]): string {
    if (permissions.length === 0) return 'No permissions';
    if (permissions.length === 1) return permissions[0].replace('_', ' ');
    if (permissions.length <= 3) {
        return permissions.map((p) => p.replace('_', ' ')).join(', ');
    }
    return `${permissions
        .slice(0, 2)
        .map((p) => p.replace('_', ' '))
        .join(', ')} +${permissions.length - 2} more`;
}

export function formatAccessLevel(level: AccessLevel): string {
    return level.charAt(0) + level.slice(1).toLowerCase();
}

export function formatStatus(status: Status): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
}

export function getStatusColor(status: Status): string {
    switch (status) {
        case 'APPROVED':
            return 'text-green-600 bg-green-50 border-green-200';
        case 'PENDING':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'DISABLED':
            return 'text-red-600 bg-red-50 border-red-200';
        case 'REJECTED':
            return 'text-red-600 bg-red-50 border-red-200';
        case 'DRAFT':
            return 'text-gray-600 bg-gray-50 border-gray-200';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
    }
}
