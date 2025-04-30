import { Prisma, Country, State } from '@prisma/client';

type Merchant = Prisma.MerchantGetPayload<{
    select: { id: true; name: true; slug: true };
}>;

export interface AddBrandFormProps {
    countryProp?: Country;
    countries: Country[];
    states: State[];
    merchantSlug?: string;
    merchants: Merchant[];
}
