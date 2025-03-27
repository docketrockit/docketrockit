import { object, string, boolean } from 'zod';

const getPasswordSchema = (type: 'password' | 'confirmPassword') =>
    string({ required_error: `${type} is required` })
        .min(8, `${type} must be atleast 8 characters`)
        .max(32, `${type} can not exceed 32 characters`);

const getEmailSchema = () =>
    string({ required_error: 'Email is required' })
        .min(1, 'Email is required')
        .email('Invalid email');

export const ForgotPasswordSchema = object({
    email: getEmailSchema()
});

export const ResetPasswordSchema = object({
    password: getPasswordSchema('password'),
    confirmPassword: getPasswordSchema('confirmPassword')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});

export const LoginSchema = object({
    email: getEmailSchema(),
    password: getPasswordSchema('password'),
    rememberMe: boolean().default(true)
});
