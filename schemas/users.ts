import * as z from 'zod';
import { Status, Permission } from '@/generated/prisma';

import { getStringSchema, getEmailSchema, getPasswordSchema } from './schemas';

const permissionSchema = z.enum(Permission);
const statusSchema = z.enum(Status);

export const AdminUserSchema = z.object({
    name: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    password: getPasswordSchema('Password'),
    phoneNumber: getStringSchema('Phone number'),
    jobTitle: getStringSchema('Job title'),
    permissions: z.array(permissionSchema)
});

export const AdminUserSchemaUpdate = z.object({
    firstName: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    phoneNumber: getStringSchema('Phone number'),
    jobTitle: getStringSchema('Job title'),
    permissions: z.array(permissionSchema),
    status: statusSchema
});

export const UserProfileSchema = z.object({
    name: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    phoneNumber: getStringSchema('Phone number'),
    jobTitle: getStringSchema('Job title'),
    city: getStringSchema('City'),
    state: getStringSchema('State'),
    postcode: getStringSchema('Postcode')
});

export const EmailSchema = z.object({
    email: getEmailSchema()
});

export const VerifyEmailSchema = z.object({
    code: getStringSchema('Verification code')
});
