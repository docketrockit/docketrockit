import { object, boolean, string } from 'zod';

import { getEmailSchema, getPasswordSchema, getStringSchema } from './schemas';

export const ForgotPasswordSchema = object({
    email: getEmailSchema()
});

export const ResetPasswordSchema = object({
    password: getPasswordSchema('Password'),
    confirmPassword: getPasswordSchema('Confirm Password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});

export const LoginSchema = object({
    email: getEmailSchema(),
    password: getPasswordSchema('Password'),
    rememberMe: boolean()
});

export const VerifyEmailSchema = object({
    code: getStringSchema('Verification code')
});

export const RecoveryCodeSchema = object({
    code: getStringSchema('Recovery code')
});

export const TwoFactorSetupSchema = object({
    code: getStringSchema('Verification code'),
    encodedKey: getStringSchema('Key', 28)
});

export const TwoFactorVerficationSchema = object({
    code: getStringSchema('Verification code')
});
