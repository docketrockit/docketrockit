import { PrismaClient } from '@prisma/client';

import currencies from './currencies.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
    const currencyEntries = Object.entries(currencies);

    for (const [code, data] of currencyEntries) {
        await prisma.currency.create({
            data: {
                code,
                name: data.name,
                demonym: data.demonym,
                majorSingle: data.majorSingle,
                majorPlural: data.majorPlural,
                ISOnum: data.ISOnum || 0,
                symbol: data.symbol,
                symbolNative: data.symbolNative,
                minorSingle: data.minorSingle,
                minorPlural: data.minorPlural,
                ISOdigits: data.ISOdigits,
                decimals: data.decimals,
                numToBasic: data.numToBasic || 0
            }
        });
    }

    console.log(`Seeded ${currencyEntries.length} currencies.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
