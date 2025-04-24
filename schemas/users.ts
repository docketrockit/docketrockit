import { object, array, nativeEnum, boolean } from 'zod';

import { getStringSchema, getEmailSchema, getPasswordSchema } from './schemas';
import { AdminRole, MerchantRole, Status } from '@prisma/client';

const adminRoleSchema = nativeEnum(AdminRole);
const merchantRoleSchema = nativeEnum(MerchantRole);
const statusSchema = nativeEnum(Status);

export const AdminUserSchema = object({
    firstName: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    password: getPasswordSchema('Password'),
    jobTitle: getStringSchema('Job title'),
    adminRole: array(adminRoleSchema)
});

export const AdminUserSchemaUpdate = object({
    firstName: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    jobTitle: getStringSchema('Job title'),
    adminRole: array(adminRoleSchema)
});

export const MerchantUserSchema = object({
    firstName: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    password: getPasswordSchema('Password'),
    jobTitle: getStringSchema('Job title'),
    merchantRole: array(merchantRoleSchema),
    primaryContact: boolean()
});

export const MerchantUserSchemaUpdate = object({
    firstName: getStringSchema('First name'),
    lastName: getStringSchema('Last name'),
    email: getEmailSchema(),
    jobTitle: getStringSchema('Job title'),
    merchantRole: array(merchantRoleSchema),
    primaryContact: boolean(),
    status: statusSchema
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
