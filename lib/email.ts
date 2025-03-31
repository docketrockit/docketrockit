import db from './db';

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
