import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { encodeBase32UpperCaseNoPadding } from '@oslojs/encoding';
import { randomBytes } from 'crypto';

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

export const generateRandomRecoveryCodes = (): string[] => {
    const recoveryCodes = [];
    for (let i = 0; i < 6; i++) {
        const recoveryCodeBytes = new Uint8Array(10);
        crypto.getRandomValues(recoveryCodeBytes);
        const recoveryCode = encodeBase32UpperCaseNoPadding(recoveryCodeBytes);
        recoveryCodes.push(recoveryCode);
    }
    return recoveryCodes;
};
