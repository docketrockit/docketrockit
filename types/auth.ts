import { Country } from '@/generated/prisma';

export interface LoginFormProps {
    callbackUrl: string;
}
export interface RegisterFormProps {
    defaultCountry: Country;
}

export interface EmailVerificationFormProps {
    email: string;
    userId?: string;
}

export interface PhoneVerificationFormProps {
    userId: string;
    phoneNumber: string;
    defaultCountry: Country;
}
