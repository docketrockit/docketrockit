import { Prisma } from '@prisma/client';

import { BrandStore } from './brandStore';

export type Store = BrandStore;

type StoreData = Prisma.StoreGetPayload<{
    include: {
        brand: true;
    };
}>;

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
}

export interface EditStoreFormProps {
    brand: StoreData;
}
