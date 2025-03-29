import { object, boolean } from 'zod';

import { getEmailSchema, getPasswordSchema } from './schemas';

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
    rememberMe: boolean().default(true)
});
