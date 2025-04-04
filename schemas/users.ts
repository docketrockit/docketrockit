import { object, array, z } from 'zod';

import { getStringSchema, getEmailSchema, getPasswordSchema } from './schemas';
import { AdminRole } from '@/types/user';

const adminRoleSchema = array(
    z.enum(Object.keys(AdminRole) as [keyof typeof AdminRole])
);

export const AdminUserSchema = object({
    name: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    password: getPasswordSchema('Password'),
    access: array(adminRoleSchema)
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
