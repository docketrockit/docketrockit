import { z } from 'zod';

export const getPasswordSchema = (type: 'Password' | 'Confirm Password') =>
    z
        .string()
        .nonempty(`${type} is required`)
        .min(8, `${type} must be at least 8 characters`)
        .max(32, `${type} cannot exceed 32 characters`)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>?/~`])/,
            `${type} must contain at least one lowercase letter, one uppercase letter, one number, and one special character.`
        );

export const getEmailSchema = () =>
    z.string().nonempty('Email is required').email('Invalid email');

export const getStringSchema = (type: string, min = 1) =>
    z
        .string()
        .nonempty(`${type} is required`)
        .min(
            min,
            `${type} must be at least ${min} character${min > 1 ? 's' : ''}`
        );
