import db from './db';
import { MerchantUser } from '@/types/merchantUsers';

export const verifyEmailInput = (email: string): boolean => {
    return /^.+@.+\..+$/.test(email) && email.length < 256;
};

export const checkEmailAvailability = async (
    email: string
): Promise<boolean> => {
    const row = await db.user.count({ where: { email } });
    if (row === null) {
        throw new Error();
    }
    return row === 0;
};

export const checkMerchantEmailAvailability = async (
    email: string
): Promise<'No' | 'New' | MerchantUser> => {
    const user = await db.user.findUnique({
        where: {
            email
        },
        include: { merchantUser: true }
    });
    if (!user) {
        return 'New';
    }
    if (user.role.includes('ADMIN') || user.role.includes('MERCHANT')) {
        return 'No';
    }
    return user;
};
