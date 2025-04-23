import { string } from 'zod';

export const getPasswordSchema = (type: 'Password' | 'Confirm Password') =>
    string({ required_error: `${type} is required` })
        .min(8, `${type} must be atleast 8 characters`)
        .max(32, `${type} can not exceed 32 characters`)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>?/~`])/,
            'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
        );

export const getEmailSchema = () =>
    string({ required_error: 'Email is required' })
        .min(1, 'Email is required')
        .email('Invalid email');

export const getStringSchema = (type: string, min = 1) =>
    string({ required_error: `${type} is required` }).min(
        min,
        `${type} is required`
    );
