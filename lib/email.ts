import { prisma } from '@/lib/prisma';

export const verifyEmailInput = (email: string): boolean => {
    return /^.+@.+\..+$/.test(email) && email.length < 256;
};

export const checkEmailAvailability = async (
    email: string
): Promise<boolean> => {
    const row = await prisma.user.count({ where: { email } });
    if (row === null) {
        throw new Error();
    }
    return row === 0;
};

// export const checkMerchantEmailAvailability = async (
//     email: string
// ): Promise<'No' | 'New' | MerchantUser> => {
//     const user = await prisma.user.findUnique({
//         where: {
//             email
//         },
//         include: { merchantUser: true, primaryContactMerchant: true }
//     });
//     if (!user) {
//         return 'New';
//     }
//     if (user.role.includes('ADMIN') || user.role.includes('MERCHANT')) {
//         return 'No';
//     }
//     return user;
// };

// export const checkBrandEmailAvailability = async (
//     email: string,
//     merchantId: string
// ): Promise<'No' | 'New' | BrandUser> => {
//     const user = await db.user.findUnique({
//         where: {
//             email
//         },
//         include: {
//             merchantUser: { include: { brandUsers: true } },
//             primaryContactBrand: true
//         }
//     });
//     if (!user) {
//         return 'New';
//     }
//     if (
//         user.role.includes('ADMIN') ||
//         (user.role.includes('MERCHANT') && !user.merchantUser) ||
//         (user.role.includes('MERCHANT') && user.merchantUser?.id !== merchantId)
//     ) {
//         return 'No';
//     }
//     return user;
// };
