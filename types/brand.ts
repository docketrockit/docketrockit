import { Prisma, Country, State } from '@prisma/client';

import { User } from '@/lib/user';
import { getBrandUsers } from '@/actions/admin/brandUsers';
import { getBrandStores } from '@/actions/admin/brandStores';

type Merchant = Prisma.MerchantGetPayload<{
    select: { id: true; name: true; slug: true };
}>;

type BrandData = Prisma.BrandGetPayload<{
    include: {
        state: true;
        country: true;
        primaryContact: true;
        merchant: true;
    };
}>;

export interface AddBrandFormProps {
    countryProp?: Country;
    countries: Country[];
    states: State[];
    merchantSlug?: string;
    merchants: Merchant[];
}

export interface EditBrandFormProps {
    brand: BrandData;
    countryProp?: Country;
    countries: Country[];
    states: State[];
    stateProp?: State;
}

export interface BrandMainProps {
    brand: BrandData;
    user: User;
    brandUsersPromise: ReturnType<typeof getBrandUsers>;
    brandStoresPromise: ReturnType<typeof getBrandStores>;
}

export interface BrandTabsProps {
    brandUsersPromise: ReturnType<typeof getBrandUsers>;
    brandStoresPromise: ReturnType<typeof getBrandStores>;
    brand: BrandData;
    user: User;
}
