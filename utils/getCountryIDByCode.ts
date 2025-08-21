import { prisma } from '@/lib/prisma';

const getCountryIDByCode = async (isoCode: string) => {
    const country = await prisma.country.findFirst({ where: { isoCode } });

    if (!country) return null;

    return country.id;
};

export default getCountryIDByCode;
