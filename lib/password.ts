import { compare, hash, genSalt } from 'bcrypt-ts';
import { sha1 } from '@oslojs/crypto/sha1';
import { encodeHexLowerCase } from '@oslojs/encoding';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await genSalt(10);
    return await hash(password, salt);
};

export const verifyPasswordHash = async (
    hash: string,
    password: string
): Promise<boolean> => {
    return await compare(password, hash);
};

export const verifyPasswordStrength = async (
    password: string
): Promise<boolean> => {
    if (password.length < 8 || password.length > 255) {
        return false;
    }
    const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
    const hashPrefix = hash.slice(0, 5);
    const response = await fetch(
        `https://api.pwnedpasswords.com/range/${hashPrefix}`
    );
    const data = await response.text();
    const items = data.split('\n');
    for (const item of items) {
        const hashSuffix = item.slice(0, 35).toLowerCase();
        if (hash === hashPrefix + hashSuffix) {
            return false;
        }
    }
    return true;
};
