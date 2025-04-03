import { PrismaClient } from '@prisma/client';
import { Country, State } from 'country-state-city';

const prisma = new PrismaClient();

async function main() {
    let count = 0;
    const countries = Country.getAllCountries();
    const countryCount = countries.length;
    for (const country of countries) {
        const countryDb = await prisma.country.create({
            data: {
                isoCode: country.isoCode,
                name: country.name,
                currency: country.currency
            }
        });
        const states = State.getStatesOfCountry(country.isoCode);
        const statesCount = states.length;
        let stateCount = 0;
        count++;

        for (const state of states) {
            const stateDb = await prisma.state.create({
                data: {
                    isoCode: state.isoCode,
                    name: state.name,
                    countryId: countryDb.id
                }
            });
            stateCount++;
            console.log(
                `State ${stateCount} / ${statesCount} - Country ${count} / ${countryCount}`
            );
        }
    }
}
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

//     model Country {
//   id        Int    @id @default(autoincrement())
//   isoCode   String
//   name      String
//   currency  String
//   states    State[]
// }

// model State {
//   id        Int    @id @default(autoincrement())
//   isoCode   String
//   name      String
//   country   Country @relation(fields: [countryId], references: [id])
//   countryId Int
// }
