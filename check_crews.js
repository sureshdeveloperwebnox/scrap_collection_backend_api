
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const crews = await prisma.crew.findMany({
        include: {
            members: true
        }
    });
    console.log('Crews with members:', JSON.stringify(crews, null, 2));

    const orders = await prisma.order.findMany({
        where: { NOT: { crewId: null } },
        include: {
            crew: {
                include: {
                    members: true
                }
            }
        }
    });
    console.log('Orders with crew details:', JSON.stringify(orders, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
