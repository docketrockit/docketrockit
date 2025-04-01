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
        html: `<p>Click <a href="${domain}/merchant/reset-password/?token=${code}">here</a> to reset password.</p>`
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

// export const sendPasswordResetEmail = async ({
//     email,
//     code
// }: {
//     email: string;
//     code: string;
// }) => {
//     await resend.emails.send({
//         from: process.env.NEXT_PUBLIC_APP_EMAIL as string,
//         to: email,
//         subject: 'Verification Code',
//         html: `Your reset code is ${code}`
//     });
// };
