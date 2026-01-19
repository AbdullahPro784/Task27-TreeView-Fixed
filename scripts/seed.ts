import { PrismaClient } from "@prisma/client";
import { DATA } from "../components/AssetTable/utils/data";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding ...");

    // Clear existing data
    await prisma.item.deleteMany();

    for (const item of DATA) {
        await prisma.item.create({
            data: {
                id: item.id,
                serial: item.serial,
                category: item.category,
                brand: item.brand,
                type: item.type,
                vehicle: item.vehicle,
                statusState: item.status.state,
                statusLevel: item.status.level,
            },
        });
    }
    console.log(`Seeded ${DATA.length} items.`);
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
