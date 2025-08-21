import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { randomBytes } from 'crypto';
import { hash } from 'bcrypt-ts';
import { Status } from '@/generated/prisma';

import {
    CheckCircledIcon,
    CircleIcon,
    CrossCircledIcon,
    QuestionMarkCircledIcon,
    StopwatchIcon,
    MinusCircledIcon
} from '@radix-ui/react-icons';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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

/**
 * Returns the appropriate status icon based on the provided status.
 * @param status - The status of the task.
 * @returns A React component representing the status icon.
 */
export const getStatusIcon = (status: Status | undefined) => {
    const statusIcons = {
        REJECTED: CrossCircledIcon,
        APPROVED: CheckCircledIcon,
        PENDING: StopwatchIcon,
        DRAFT: QuestionMarkCircledIcon,
        DISABLED: MinusCircledIcon
    };

    return status ? statusIcons[status] : CircleIcon;
};

export const formatDate = (
    date: Date | string | number,
    opts: Intl.DateTimeFormatOptions = {}
) => {
    return new Intl.DateTimeFormat('en-US', {
        month: opts.month ?? 'long',
        day: opts.day ?? 'numeric',
        year: opts.year ?? 'numeric',
        ...opts
    }).format(new Date(date));
};

export function formatBytes(
    bytes: number,
    opts: {
        decimals?: number;
        sizeType?: 'accurate' | 'normal';
    } = {}
) {
    const { decimals = 0, sizeType = 'normal' } = opts;

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
        sizeType === 'accurate'
            ? (accurateSizes[i] ?? 'Bytest')
            : (sizes[i] ?? 'Bytes')
    }`;
}

export function normalizeName(name: string) {
    return name
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^a-zA-Z\s'-]/g, '')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
