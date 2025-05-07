import { Prisma } from '@prisma/client';

import { BrandStore } from './brandStore';
import { User } from '@/lib/user';

export type Store = BrandStore;

type Brand = Prisma.BrandGetPayload<{
    select: { id: true; name: true; slug: true };
}>;

type Currency = Prisma.CurrencyGetPayload<{
    select: { id: true; name: true; code: true; symbolNative: true };
}>;

export interface AddStoreFormProps {
    brandSlug?: string;
    brands: Brand[];
    currencies: Currency[];
    defaultCurrency: Currency | null;
}

export interface EditStoreFormProps {
    store: Store;
    currencies: Currency[];
}

export interface StoreMainProps {
    store: Store;
    user: User;
}
