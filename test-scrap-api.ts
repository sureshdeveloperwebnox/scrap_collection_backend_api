import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testScrapCollectionAPI() {
    try {
        console.log('\n=== Testing Scrap Collection Records ===\n');

        // Get the most recent record
        const latestRecord = await prisma.scrap_collection_records.findFirst({
            orderBy: { createdAt: 'desc' },
            include: {
                Order: true,
                scrap_categories: true,
                scrap_names: true,
                Customer: true,
                Employee: true
            }
        });

        if (!latestRecord) {
            console.log('❌ No scrap collection records found in database');
            return;
        }

        console.log('✅ Latest Record Found:');
        console.log('  ID:', latestRecord.id);
        console.log('  Work Order ID:', latestRecord.workOrderId);
        console.log('  Order Number:', latestRecord.Order?.orderNumber || 'N/A');
        console.log('  Collector ID:', latestRecord.collectorId);
        console.log('  Customer:', latestRecord.Customer?.name || 'N/A');
        console.log('  Category:', latestRecord.scrap_categories?.name || 'N/A');
        console.log('  Status:', latestRecord.collectionStatus);
        console.log('  Created:', latestRecord.createdAt);

        // Test the query that the API uses
        console.log('\n=== Testing API Query ===\n');
        console.log('Searching for workOrderId:', latestRecord.workOrderId);

        const records = await prisma.scrap_collection_records.findMany({
            where: {
                workOrderId: latestRecord.workOrderId
            },
            include: {
                scrap_categories: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                scrap_names: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                Order: {
                    select: {
                        id: true,
                        orderNumber: true
                    }
                },
                Customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                },
                Employee: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`✅ Found ${records.length} record(s) for this work order`);

        if (records.length > 0) {
            console.log('\nRecord details:');
            records.forEach((record, idx) => {
                console.log(`\n  Record ${idx + 1}:`);
                console.log('    ID:', record.id);
                console.log('    Collection Date:', record.collectionDate);
                console.log('    Final Amount:', record.finalAmount);
                console.log('    Status:', record.collectionStatus);
            });
        }

        console.log('\n=== API Endpoint to Test ===');
        console.log(`GET http://localhost:9645/api/v1/scrap-collections/work-order/${latestRecord.workOrderId}`);
        console.log('\nYou can test this in your browser or with curl:');
        console.log(`curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:9645/api/v1/scrap-collections/work-order/${latestRecord.workOrderId}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testScrapCollectionAPI();
