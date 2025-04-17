import db from '@/lib/db';

const getCountryIDByCode = async (isoCode: string) => {
    const country = await db.country.findFirst({ where: { isoCode } });

    if (!country) return null;

    return country.id;
};

export default getCountryIDByCode;
