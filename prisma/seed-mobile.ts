import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed process...\n');

    // Get the organization (assuming it exists)
    let organization = await prisma.organization.findFirst();

    if (!organization) {
        console.log('Creating organization...');
        const country = await prisma.country.findFirst();
        if (!country) {
            throw new Error('No country found. Please ensure countries are seeded first.');
        }

        organization = await prisma.organization.create({
            data: {
                name: 'Scrap Collection Inc',
                address: '123 Business Park, Bangalore',
                phone: '+919876543210',
                email: 'info@scrapcollection.com',
                countryId: country.id,
                isActive: true
            }
        });
        console.log('✅ Organization created\n');
    }

    // Create Collector Role
    console.log('Creating/Finding Collector Role...');
    let collectorRole = await prisma.role.findFirst({
        where: { name: 'Collector' }
    });

    if (!collectorRole) {
        collectorRole = await prisma.role.create({
            data: {
                name: 'Collector',
                description: 'Field collector for scrap collection',
                isActive: true
            }
        });
    }
    console.log('✅ Collector role ready\n');

    // Create Scrap Yards
    console.log('Creating Scrap Yards...');
    const scrapYards = await Promise.all([
        prisma.scrapYard.upsert({
            where: { id: 'yard-1' },
            update: {},
            create: {
                id: 'yard-1',
                yardName: 'North Bangalore Scrap Yard',
                address: 'Hebbal, Bangalore - 560024',
                latitude: 13.0358,
                longitude: 77.5970,
                organizationId: organization.id,
                isActive: true
            }
        }),
        prisma.scrapYard.upsert({
            where: { id: 'yard-2' },
            update: {},
            create: {
                id: 'yard-2',
                yardName: 'South Bangalore Scrap Yard',
                address: 'Jayanagar, Bangalore - 560041',
                latitude: 12.9250,
                longitude: 77.5838,
                organizationId: organization.id,
                isActive: true
            }
        })
    ]);
    console.log(`✅ Created ${scrapYards.length} scrap yards\n`);

    // Create Scrap Categories
    console.log('Creating Scrap Categories...');
    const scrapCategories = await Promise.all([
        prisma.scrapCategory.upsert({
            where: { id: 'cat-electronics' },
            update: {},
            create: {
                id: 'cat-electronics',
                name: 'Electronics',
                description: 'Electronic items and appliances',
                organizationId: organization.id,
                isActive: true
            }
        }),
        prisma.scrapCategory.upsert({
            where: { id: 'cat-metal' },
            update: {},
            create: {
                id: 'cat-metal',
                name: 'Metal Scrap',
                description: 'Metal items and parts',
                organizationId: organization.id,
                isActive: true
            }
        }),
        prisma.scrapCategory.upsert({
            where: { id: 'cat-vehicles' },
            update: {},
            create: {
                id: 'cat-vehicles',
                name: 'Vehicles',
                description: 'Cars, bikes, and other vehicles',
                organizationId: organization.id,
                isActive: true
            }
        })
    ]);
    console.log(`✅ Created ${scrapCategories.length} scrap categories\n`);

    // Create Scrap Names
    console.log('Creating Scrap Names...');
    const scrapNames = await Promise.all([
        prisma.scrapName.upsert({
            where: { id: 'name-fridge' },
            update: {},
            create: {
                id: 'name-fridge',
                name: 'Refrigerator',
                scrapCategoryId: 'cat-electronics',
                organizationId: organization.id,
                isActive: true
            }
        }),
        prisma.scrapName.upsert({
            where: { id: 'name-washing-machine' },
            update: {},
            create: {
                id: 'name-washing-machine',
                name: 'Washing Machine',
                scrapCategoryId: 'cat-electronics',
                organizationId: organization.id,
                isActive: true
            }
        }),
        prisma.scrapName.upsert({
            where: { id: 'name-car' },
            update: {},
            create: {
                id: 'name-car',
                name: 'Car',
                scrapCategoryId: 'cat-vehicles',
                organizationId: organization.id,
                isActive: true
            }
        })
    ]);
    console.log(`✅ Created ${scrapNames.length} scrap names\n`);

    // Create Collectors (Employees)
    console.log('Creating Collectors...');
    const hashedPassword = await bcrypt.hash('collector123', 10);

    const collectors = await Promise.all([
        prisma.employee.upsert({
            where: { id: 'collector-1' },
            update: {},
            create: {
                id: 'collector-1',
                fullName: 'Rajesh Kumar',
                email: 'rajesh@collector.com',
                phone: '+919876543211',
                roleId: collectorRole.id,
                passwordHash: hashedPassword,
                organizationId: organization.id,
                scrapYardId: scrapYards[0].id,
                isActive: true,
                rating: 4.5,
                completedPickups: 45
            }
        }),
        prisma.employee.upsert({
            where: { id: 'collector-2' },
            update: {},
            create: {
                id: 'collector-2',
                fullName: 'Suresh Reddy',
                email: 'suresh@collector.com',
                phone: '+919876543212',
                roleId: collectorRole.id,
                passwordHash: hashedPassword,
                organizationId: organization.id,
                scrapYardId: scrapYards[1].id,
                isActive: true,
                rating: 4.8,
                completedPickups: 62
            }
        }),
        prisma.employee.upsert({
            where: { id: 'collector-3' },
            update: {},
            create: {
                id: 'collector-3',
                fullName: 'Amit Sharma',
                email: 'amit@collector.com',
                phone: '+919876543213',
                roleId: collectorRole.id,
                passwordHash: hashedPassword,
                organizationId: organization.id,
                scrapYardId: scrapYards[0].id,
                isActive: true,
                rating: 4.2,
                completedPickups: 28
            }
        })
    ]);
    console.log(`✅ Created ${collectors.length} collectors`);
    console.log('   📧 Login: rajesh@collector.com / collector123');
    console.log('   📧 Login: suresh@collector.com / collector123');
    console.log('   📧 Login: amit@collector.com / collector123\n');

    // Create Customers
    console.log('Creating Customers...');
    const customers = await Promise.all([
        prisma.customer.upsert({
            where: { id: 'customer-1' },
            update: {},
            create: {
                id: 'customer-1',
                name: 'Priya Sharma',
                phone: '+919123456781',
                email: 'priya@example.com',
                address: '45 MG Road, Bangalore',
                latitude: 12.9716,
                longitude: 77.5946,
                organizationId: organization.id,
                accountStatus: 'ACTIVE'
            }
        }),
        prisma.customer.upsert({
            where: { id: 'customer-2' },
            update: {},
            create: {
                id: 'customer-2',
                name: 'Vikram Patel',
                phone: '+919123456782',
                email: 'vikram@example.com',
                address: '78 Indiranagar, Bangalore',
                latitude: 12.9784,
                longitude: 77.6408,
                organizationId: organization.id,
                accountStatus: 'ACTIVE'
            }
        }),
        prisma.customer.upsert({
            where: { id: 'customer-3' },
            update: {},
            create: {
                id: 'customer-3',
                name: 'Anjali Desai',
                phone: '+919123456783',
                email: 'anjali@example.com',
                address: '12 Koramangala, Bangalore',
                latitude: 12.9352,
                longitude: 77.6245,
                organizationId: organization.id,
                accountStatus: 'ACTIVE'
            }
        }),
        prisma.customer.upsert({
            where: { id: 'customer-4' },
            update: {},
            create: {
                id: 'customer-4',
                name: 'Rahul Mehta',
                phone: '+919123456784',
                email: 'rahul@example.com',
                address: '89 Whitefield, Bangalore',
                latitude: 12.9698,
                longitude: 77.7500,
                organizationId: organization.id,
                accountStatus: 'ACTIVE'
            }
        }),
        prisma.customer.upsert({
            where: { id: 'customer-5' },
            update: {},
            create: {
                id: 'customer-5',
                name: 'Sneha Iyer',
                phone: '+919123456785',
                email: 'sneha@example.com',
                address: '34 HSR Layout, Bangalore',
                latitude: 12.9121,
                longitude: 77.6446,
                organizationId: organization.id,
                accountStatus: 'ACTIVE'
            }
        })
    ]);
    console.log(`✅ Created ${customers.length} customers\n`);

    // Create Work Orders
    console.log('Creating Work Orders...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const orders = await Promise.all([
        // ASSIGNED orders
        prisma.order.upsert({
            where: { id: 'order-1' },
            update: {},
            create: {
                id: 'order-1',
                orderNumber: 'WO-24122024-001',
                customerName: customers[0].name,
                customerPhone: customers[0].phone,
                customerEmail: customers[0].email,
                customerId: customers[0].id,
                address: customers[0].address!,
                latitude: customers[0].latitude,
                longitude: customers[0].longitude,
                vehicleDetails: {
                    make: 'Samsung',
                    model: 'Double Door Refrigerator',
                    year: '2015',
                    condition: 'Not working'
                },
                assignedCollectorId: collectors[0].id,
                yardId: scrapYards[0].id,
                pickupTime: tomorrow,
                orderStatus: 'ASSIGNED',
                paymentStatus: 'UNPAID',
                quotedPrice: 3500,
                organizationId: organization.id,
                customerNotes: 'Refrigerator stopped cooling. Need pickup ASAP.'
            }
        }),
        prisma.order.upsert({
            where: { id: 'order-2' },
            update: {},
            create: {
                id: 'order-2',
                orderNumber: 'WO-24122024-002',
                customerName: customers[1].name,
                customerPhone: customers[1].phone,
                customerEmail: customers[1].email,
                customerId: customers[1].id,
                address: customers[1].address!,
                latitude: customers[1].latitude,
                longitude: customers[1].longitude,
                vehicleDetails: {
                    make: 'LG',
                    model: 'Front Load Washing Machine',
                    year: '2018',
                    condition: 'Damaged drum'
                },
                assignedCollectorId: collectors[0].id,
                yardId: scrapYards[0].id,
                pickupTime: tomorrow,
                orderStatus: 'ASSIGNED',
                paymentStatus: 'UNPAID',
                quotedPrice: 2800,
                organizationId: organization.id,
                customerNotes: 'Washing machine drum is broken.'
            }
        }),
        prisma.order.upsert({
            where: { id: 'order-3' },
            update: {},
            create: {
                id: 'order-3',
                orderNumber: 'WO-24122024-003',
                customerName: customers[2].name,
                customerPhone: customers[2].phone,
                customerEmail: customers[2].email,
                customerId: customers[2].id,
                address: customers[2].address!,
                latitude: customers[2].latitude,
                longitude: customers[2].longitude,
                vehicleDetails: {
                    make: 'Maruti',
                    model: 'Alto 800',
                    year: '2010',
                    condition: 'Accident damaged'
                },
                assignedCollectorId: collectors[1].id,
                yardId: scrapYards[1].id,
                pickupTime: now,
                orderStatus: 'ASSIGNED',
                paymentStatus: 'UNPAID',
                quotedPrice: 45000,
                organizationId: organization.id,
                customerNotes: 'Car met with accident. Total loss.'
            }
        }),
        // IN_PROGRESS orders
        prisma.order.upsert({
            where: { id: 'order-4' },
            update: {},
            create: {
                id: 'order-4',
                orderNumber: 'WO-23122024-004',
                customerName: customers[3].name,
                customerPhone: customers[3].phone,
                customerEmail: customers[3].email,
                customerId: customers[3].id,
                address: customers[3].address!,
                latitude: customers[3].latitude,
                longitude: customers[3].longitude,
                vehicleDetails: {
                    make: 'Whirlpool',
                    model: 'Air Conditioner 1.5 Ton',
                    year: '2016',
                    condition: 'Compressor failed'
                },
                assignedCollectorId: collectors[1].id,
                yardId: scrapYards[1].id,
                pickupTime: now,
                orderStatus: 'IN_PROGRESS',
                paymentStatus: 'UNPAID',
                quotedPrice: 4200,
                organizationId: organization.id,
                customerNotes: 'AC compressor not working.'
            }
        }),
        // COMPLETED orders
        prisma.order.upsert({
            where: { id: 'order-5' },
            update: {},
            create: {
                id: 'order-5',
                orderNumber: 'WO-23122024-005',
                customerName: customers[4].name,
                customerPhone: customers[4].phone,
                customerEmail: customers[4].email,
                customerId: customers[4].id,
                address: customers[4].address!,
                latitude: customers[4].latitude,
                longitude: customers[4].longitude,
                vehicleDetails: {
                    make: 'Sony',
                    model: 'LED TV 42 inch',
                    year: '2014',
                    condition: 'Screen broken'
                },
                assignedCollectorId: collectors[2].id,
                yardId: scrapYards[0].id,
                pickupTime: yesterday,
                orderStatus: 'COMPLETED',
                paymentStatus: 'PAID',
                quotedPrice: 2500,
                actualPrice: 2500,
                organizationId: organization.id,
                customerNotes: 'TV screen cracked.',
                photos: [
                    'https://example.com/tv-photo1.jpg',
                    'https://example.com/tv-photo2.jpg'
                ]
            }
        }),
        prisma.order.upsert({
            where: { id: 'order-6' },
            update: {},
            create: {
                id: 'order-6',
                orderNumber: 'WO-22122024-006',
                customerName: customers[0].name,
                customerPhone: customers[0].phone,
                customerEmail: customers[0].email,
                customerId: customers[0].id,
                address: customers[0].address!,
                latitude: customers[0].latitude,
                longitude: customers[0].longitude,
                vehicleDetails: {
                    make: 'Bajaj',
                    model: 'Pulsar 150',
                    year: '2012',
                    condition: 'Engine seized'
                },
                assignedCollectorId: collectors[0].id,
                yardId: scrapYards[0].id,
                pickupTime: yesterday,
                orderStatus: 'COMPLETED',
                paymentStatus: 'PAID',
                quotedPrice: 8000,
                actualPrice: 8500,
                organizationId: organization.id,
                customerNotes: 'Old bike, engine not working.',
                photos: [
                    'https://example.com/bike-photo1.jpg'
                ]
            }
        })
    ]);
    console.log(`✅ Created ${orders.length} work orders\n`);

    // Create Order Timeline entries
    console.log('Creating Order Timeline entries...');
    await Promise.all([
        prisma.orderTimeline.create({
            data: {
                orderId: 'order-1',
                status: 'ASSIGNED',
                notes: 'Order assigned to collector',
                performedBy: collectors[0].id
            }
        }),
        prisma.orderTimeline.create({
            data: {
                orderId: 'order-4',
                status: 'ASSIGNED',
                notes: 'Order assigned to collector',
                performedBy: collectors[1].id
            }
        }),
        prisma.orderTimeline.create({
            data: {
                orderId: 'order-4',
                status: 'IN_PROGRESS',
                notes: 'Collector started the pickup at customer location',
                performedBy: collectors[1].id
            }
        }),
        prisma.orderTimeline.create({
            data: {
                orderId: 'order-5',
                status: 'COMPLETED',
                notes: 'Pickup completed successfully',
                performedBy: collectors[2].id
            }
        })
    ]);
    console.log('✅ Created order timeline entries\n');

    console.log('🎉 Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${scrapYards.length} Scrap Yards`);
    console.log(`   - ${scrapCategories.length} Scrap Categories`);
    console.log(`   - ${scrapNames.length} Scrap Names`);
    console.log(`   - ${collectors.length} Collectors`);
    console.log(`   - ${customers.length} Customers`);
    console.log(`   - ${orders.length} Work Orders`);
    console.log(`     • 3 ASSIGNED`);
    console.log(`     • 1 IN_PROGRESS`);
    console.log(`     • 2 COMPLETED\n`);

    console.log('🔐 Test Credentials:');
    console.log('   Email: rajesh@collector.com');
    console.log('   Password: collector123\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
