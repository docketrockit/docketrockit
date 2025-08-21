'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendCreateAdminUserAccountEmail = async ({
    email,
    name,
    password,
    code
}: {
    email: string;
    name: string;
    password: string;
    code: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'DocketRockit - Admin Dashboard - Account Created',
        html: `<p>Hi ${name},</p>
        <p>An account for the DocketRockit Admin Dashboard has been created for you.</p>
        <p>Please use the link below to login. Your temporary password is: ${password}</p>
        <p>You will need to change this on your first login.</p>
        <p>Your email verification code is ${code}.</p>
        <p>Click <a href="${domain}/auth/login">here</a> to login.</p>`
    });
};

export const sendVerificationEmail = async ({
    email,
    link
}: {
    email: string;
    link: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'Buxmate - Confirm your email',
        html: `<p>Click <a href="${link}">here</a> to confirm email.</p>`
    });
};

export const sendEmailVerificationOtpEmail = async ({
    email,
    otp
}: {
    email: string;
    otp: string;
}) => {
    const sent = await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: `Buxmate - Email Verification - ${otp}`,
        html: `<p>Your email verification code is ${otp}.</p>`
    });

    return sent;
};

export const sendResetEmail = async ({
    email,
    link,
    name
}: {
    email: string;
    link: string;
    name: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'Buxmate - Reset password',
        html: `<p>Your password has been reset ${link}</p>`
    });
};

export const sendPasswordResetNotificationEmail = async ({
    email
}: {
    email: string;
}) => {
    await resend.emails.send({
        from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
        to: email,
        subject: 'Buxmate - Your password has been reset',
        html: `<p>Your password has been reset</p>`
    });
};
