import { Status } from '@/generated/prisma';

export const statusLabels: { value: Status; label: string }[] = [
    { value: Status.DRAFT, label: 'Draft' },
    { value: Status.PENDING, label: 'Pending' },
    { value: Status.APPROVED, label: 'Approved' },
    { value: Status.DISABLED, label: 'Disabled' },
    { value: Status.REJECTED, label: 'Rejected' }
];

export type ParamsSlug = Promise<{ slug: string }>;

export type ParamsBrand = Promise<{ slug: string; brandSlug: string }>;

export type ParamsStore = Promise<{
    slug: string;
    brandSlug: string;
    storeSlug: string;
}>;

export type ParamsToken = Promise<{ token: string }>;
