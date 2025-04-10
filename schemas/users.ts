import { object, array, nativeEnum } from 'zod';

import { getStringSchema, getEmailSchema, getPasswordSchema } from './schemas';
import { AdminRole } from '@prisma/client';

const adminRoleSchema = nativeEnum(AdminRole);

export const AdminUserSchema = object({
    firstName: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    password: getPasswordSchema('Password'),
    jobTitle: getStringSchema('Job title'),
    adminRole: array(adminRoleSchema)
});

export const UserProfileSchema = object({
    firstName: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    phoneNumber: getStringSchema('Phone number'),
    jobTitle: getStringSchema('Job title'),
    city: getStringSchema('City'),
    state: getStringSchema('State'),
    postcode: getStringSchema('Postcode')
});

export const EmailSchema = object({
    email: getEmailSchema()
});

export const VerifyEmailSchema = object({
    code: getStringSchema('Verification code')
});
