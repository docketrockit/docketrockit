import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { encodeBase32UpperCaseNoPadding } from '@oslojs/encoding';
import { randomBytes } from 'crypto';
import { hash } from 'bcrypt-ts';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const generateRandomOTP = (): string => {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    const code = encodeBase32UpperCaseNoPadding(bytes);
    return code;
};

export const generateResetPasswordToken = (): string => {
    const token = randomBytes(16).toString('hex');
    return token;
};

export const generateRandomString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
};

export interface RecoveryCodes {
    recoveryCodes: string[];
    recoveryCodesHashed: string[];
}

export const generateRandomRecoveryCodes = async (): Promise<RecoveryCodes> => {
    // const recoveryCodes = [];
    // for (let i = 0; i < 6; i++) {
    //     const recoveryCodeBytes = new Uint8Array(10);
    //     crypto.getRandomValues(recoveryCodeBytes);
    //     const recoveryCode = encodeBase32UpperCaseNoPadding(recoveryCodeBytes);
    //     recoveryCodes.push(recoveryCode);
    // }
    // return recoveryCodes;
    const recoveryCodes = [];
    const recoveryCodesHashed = [];
    for (let i = 0; i < 6; i++) {
        const recoveryCode = generateRandomString(6);
        const chars = [...recoveryCode];
        chars.splice(3, 0, '-');
        const hashedCode = await hash(recoveryCode, 12);
        recoveryCodes.push(chars.join(''));
        recoveryCodesHashed.push(hashedCode);
    }
    return { recoveryCodes, recoveryCodesHashed };
};
