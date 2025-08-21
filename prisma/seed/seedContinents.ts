import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const continents = [
    'Asia',
    'Europe',
    'Africa',
    'Oceania',
    'North America',
    'South America',
    'Antarctica'
];

async function seedContinents() {
    try {
        console.log('🌎 Seeding countries...');
        for (const continent of continents) {
            await prisma.continent.create({
                data: {
                    name: continent
                }
            });
        }
        console.log(`✅ Seeded ${continents.length} countries`);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
}

seedContinents()
    .catch((error) => {
        console.error('💥 Seed failed:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
