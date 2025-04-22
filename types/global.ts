import { Status } from '@prisma/client';

import { Session } from '@/lib/session';
import { User } from '@/lib/user';
import { AdminUser } from '@/types/adminUsers';
import { MerchantUser } from '@/types/merchantUsers';

export interface SessionUserProps {
    session: Session;
    user: User;
}

export type SearchParams = Promise<{
    [key: string]: string | string[] | undefined;
}>;

export const statusLabels: { value: Status; label: string }[] = [
    { value: Status.DRAFT, label: 'Draft' },
    { value: Status.PENDING, label: 'Pending' },
    { value: Status.APPROVED, label: 'Approved' },
    { value: Status.DISABLED, label: 'Disabled' },
    { value: Status.REJECTED, label: 'Rejected' }
];

export interface UserResetPasswordDialogProps {
    user: AdminUser | MerchantUser;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export type ParamsSlug = Promise<{ slug: string }>;
