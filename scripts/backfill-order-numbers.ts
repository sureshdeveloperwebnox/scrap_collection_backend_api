import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate order number with format: WO-DDMMYYYY-N
 */
function generateOrderNumber(createdAt: Date, sequentialNumber: number): string {
    const day = String(createdAt.getDate()).padStart(2, '0');
    const month = String(createdAt.getMonth() + 1).padStart(2, '0');
    const year = createdAt.getFullYear();
    const datePrefix = `${day}${month}${year}`;

    return `WO-${datePrefix}-${sequentialNumber}`;
}

async function backfillOrderNumbers() {
    try {
        console.log('Starting order number backfill...');

        // Get all orders without order numbers, sorted by creation date
        const orders = await prisma.order.findMany({
            where: {
                orderNumber: null
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`Found ${orders.length} orders without order numbers`);

        // Group orders by date and organization
        const ordersByDateAndOrg = new Map<string, number>();

        for (const order of orders) {
            const dateKey = `${order.organizationId}-${order.createdAt.toISOString().split('T')[0]}`;
            const currentCount = ordersByDateAndOrg.get(dateKey) || 0;
            const sequentialNumber = currentCount + 1;
            ordersByDateAndOrg.set(dateKey, sequentialNumber);

            const orderNumber = generateOrderNumber(order.createdAt, sequentialNumber);

            // Update the order
            await prisma.order.update({
                where: { id: order.id },
                data: { orderNumber }
            });

            console.log(`Updated order ${order.id} with order number: ${orderNumber}`);
        }

        console.log('Backfill completed successfully!');
    } catch (error) {
        console.error('Error during backfill:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

backfillOrderNumbers();
