'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendPasswordResetEmail = async ({
    email,
    code
}: {
    email: string;
    code: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'Reset your password',
        html: `<p>Click <a href="${domain}/auth/reset-password/?token=${code}">here</a> to reset password.</p>`
    });
};

export const sendVerificationEmail = async ({
    email,
    code
}: {
    email: string;
    code: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'Verification Code',
        html: `Your verification code is ${code}`
    });
};

export const sendCreateAdminUserAccountEmail = async ({
    email,
    firstName,
    password,
    code
}: {
    email: string;
    firstName: string;
    password: string;
    code: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'DocketRockit - Admin Dashboard - Account Created',
        html: `<p>Hi ${firstName},</p>
        <p>An account for the DocketRockit Admin Dashboard has been created for you.</p>
        <p>Please use the link below to login. Your temporary password is: ${password}</p>
        <p>You will need to change this on your first login.</p>
        <p>Your email verification code is ${code}.</p>
        <p>Click <a href="${domain}/auth/login">here</a> to login.</p>`
    });
};

export const sendUpdatedUserToAdminEmail = async ({
    email,
    firstName
}: {
    email: string;
    firstName: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'DocketRockit - Admin Dashboard - Account Created',
        html: `<p>Hi ${firstName},</p>
        <p>An account for the DocketRockit Admin Dashboard has been created for you.</p>
        <p>Please use the link below to login. Your login is your DocketRockit login and password.</p>
        <p>Click <a href="${domain}/auth/login">here</a> to login.</p>`
    });
};

export const sendUserPasswordResetEmail = async ({
    email,
    firstName,
    password
}: {
    email: string;
    firstName: string;
    password: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'DocketRockit - Merchant Dashboard - Password Reset',
        html: `<p>Hi ${firstName},</p>
        <p>Your DocketRockit Merchant Dashboard password has been reset.</p>
        <p>Please use the link below to login. Your temporary password is: ${password}</p>
        <p>You will need to change this on your first login.</p>
        <p>Click <a href="${domain}/auth/login">here</a> to login.</p>`
    });
};

export const sendUserTwoFactorResetEmail = async ({
    email,
    firstName
}: {
    email: string;
    firstName: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject:
            'DocketRockit - Merchant Dashboard - Two Factor Authentication Reset',
        html: `<p>Hi ${firstName},</p>
        <p>Your DocketRockit Merchant Dashboard two factor authentication has been reset.</p>
        <p>Please use the link below to login.</p>
        <p>You will need to reset this when you next login.</p>
        <p>Click <a href="${domain}/auth/login">here</a> to login.</p>`
    });
};
