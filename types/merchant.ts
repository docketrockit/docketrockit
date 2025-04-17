import { Country, State } from '@prisma/client';

export interface AddMerchantFormProps {
    stateProp?: State;
    countryProp?: Country;
    countries: Country[];
    states: State[];
}
