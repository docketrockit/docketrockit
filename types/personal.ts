import { auth } from '@/lib/auth';

export type Session = typeof auth.$Infer.Session;
export type SessionType = Awaited<ReturnType<typeof auth.api.getSession>>;
import { Country, Gender, Region } from '@/generated/prisma';

export interface GenderProps {
    genderProp?: Gender;
    userSession: SessionType | null;
}

export interface LocationProps {
    regionProp?: Region;
    countryProp?: Country;
    countries: Country[];
    regions: Region[];
    initialValueProp: boolean;
    userSession: SessionType | null;
}

export interface DateOfBirthProps {
    dateOfBirthProp?: Date;
    userSession: SessionType | null;
}

export interface LocationData {
    countries: Country[] | null;
    defaultCountry: Country;
    regions: Region[] | null;
    country: Country | null;
    region: Region | null;
    initialValueProp: boolean;
}
