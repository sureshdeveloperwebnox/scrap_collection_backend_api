import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============ ORGANIZATION CREDENTIALS (save these) ============
const ORG_NAME = 'AUSSIE SCRAPX';
const ADMIN_EMAIL = 'admin@aussiescrapx.com.au';
const ADMIN_PASSWORD = 'AussieScrapx@2025';
const ADMIN_FIRST_NAME = 'Suresh';
const ADMIN_LAST_NAME = 'Admin';

// Australian cities with approximate coordinates
const AU_CITIES = [
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Melbourne', latitude: -37.8136, longitude: 144.9631 },
  { name: 'Brisbane', latitude: -27.4698, longitude: 153.0251 },
  { name: 'Perth', latitude: -31.9505, longitude: 115.8605 },
  { name: 'Adelaide', latitude: -34.9285, longitude: 138.6007 },
  { name: 'Newcastle', latitude: -32.9283, longitude: 151.7817 },
  { name: 'Gold Coast', latitude: -28.0167, longitude: 153.4000 },
  { name: 'Wollongong', latitude: -34.4278, longitude: 150.8931 },
];

// Scrap categories (Scrap Management)
const SCRAP_CATEGORIES = [
  { name: 'Ferrous Metal', description: 'Iron, steel, and other magnetic metals' },
  { name: 'Non-Ferrous Metal', description: 'Aluminium, copper, brass, lead' },
  { name: 'Whitegoods', description: 'Fridges, washing machines, dryers, dishwashers' },
  { name: 'Electronics', description: 'Computers, TVs, cables, circuit boards' },
  { name: 'Car Bodies', description: 'End-of-life vehicles and body shells' },
  { name: 'Mixed Scrap', description: 'General mixed scrap metal and materials' },
];

// Scrap names per category (keyed by category name)
const SCRAP_NAMES: Record<string, string[]> = {
  'Ferrous Metal': ['Steel beams', 'Reinforcing bar', 'Cast iron', 'Steel sheet', 'Scrap steel'],
  'Non-Ferrous Metal': ['Copper wire', 'Aluminium extrusions', 'Brass fittings', 'Lead acid batteries', 'Stainless steel'],
  'Whitegoods': ['Refrigerator', 'Washing machine', 'Dryer', 'Dishwasher', 'Freezer'],
  'Electronics': ['Desktop PC', 'Laptop', 'CRT TV', 'Flat screen TV', 'Cables & wiring'],
  'Car Bodies': ['Sedan body', 'SUV body', 'Ute/truck cab', 'Car shell', 'Vehicle chassis'],
  'Mixed Scrap': ['Household scrap', 'Light iron', 'Heavy steel', 'Mixed metals', 'Demolition scrap'],
};

// Vehicle types (for vehicle_types table - org scoped)
const VEHICLE_TYPES = [
  { name: 'Car', icon: 'car' },
  { name: 'Bike', icon: 'bike' },
  { name: 'Truck', icon: 'truck' },
  { name: 'Van', icon: 'van' },
  { name: 'SUV', icon: 'suv' },
];

// Vehicle names (make/model style for collectors)
const VEHICLE_NAMES = [
  { name: 'Toyota Hilux', vehicleType: 'Truck', make: 'Toyota', model: 'Hilux' },
  { name: 'Ford Ranger', vehicleType: 'Truck', make: 'Ford', model: 'Ranger' },
  { name: 'Toyota Hiace', vehicleType: 'Van', make: 'Toyota', model: 'Hiace' },
  { name: 'Mercedes Sprinter', vehicleType: 'Van', make: 'Mercedes-Benz', model: 'Sprinter' },
  { name: 'Toyota Land Cruiser', vehicleType: 'SUV', make: 'Toyota', model: 'Land Cruiser' },
  { name: 'Isuzu D-Max', vehicleType: 'Truck', make: 'Isuzu', model: 'D-Max' },
  { name: 'Mitsubishi Triton', vehicleType: 'Truck', make: 'Mitsubishi', model: 'Triton' },
  { name: 'Hyundai iLoad', vehicleType: 'Van', make: 'Hyundai', model: 'iLoad' },
];

function generateOrderNumber(createdAt: Date, seq: number): string {
  const d = String(createdAt.getDate()).padStart(2, '0');
  const m = String(createdAt.getMonth() + 1).padStart(2, '0');
  const y = createdAt.getFullYear();
  return `WO-${d}${m}${y}-${seq}`;
}

async function main() {
  console.log('Seeding Australian data for AUSSIE SCRAPX...\n');

  // 1. Country - Australia
  let country = await prisma.country.findFirst({ where: { name: 'Australia' } });
  if (!country) {
    country = await prisma.country.create({
      data: { name: 'Australia', currency: 'AUD', isActive: true },
    });
    console.log('Created Country: Australia (AUD)');
  } else {
    console.log('Using existing Country: Australia');
  }

  // 2. Roles (for employees - Collector, Admin, Supervisor)
  const roleNames = ['Collector', 'Admin', 'Supervisor', 'Accountant'];
  const roles: Record<string, { id: number }> = {};
  for (const r of roleNames) {
    let role = await prisma.roles.findUnique({ where: { name: r } });
    if (!role) {
      role = await prisma.roles.create({
        data: { name: r, description: `${r} role`, isActive: true },
      });
      console.log('Created role:', r);
    }
    roles[r] = { id: role.id };
  }

  // 3. Organization - AUSSIE SCRAPX
  let org = await prisma.organization.findFirst({
    where: { name: ORG_NAME },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: ORG_NAME,
        email: ADMIN_EMAIL,
        phone: '+61 2 9123 4567',
        address: 'Level 5, 100 William Street, Sydney NSW 2011',
        billingAddress: 'Level 5, 100 William Street, Sydney NSW 2011',
        website: 'https://aussiescrapx.com.au',
        description: 'Australian scrap metal collection and recycling',
        isActive: true,
        countryId: country.id,
        latitude: -33.8688,
        longitude: 151.2093,
      },
    });
    console.log('Created Organization:', ORG_NAME);
  } else {
    console.log('Using existing Organization:', ORG_NAME);
  }

  const orgId = org.id;
  const hashAdmin = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // 4. Admin user (dashboard login)
  let adminUser = await prisma.users.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!adminUser) {
    adminUser = await prisma.users.create({
      data: {
        email: ADMIN_EMAIL,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        hashPassword: hashAdmin,
        role: 'ADMIN',
        organizationId: orgId,
      },
    });
    console.log('Created Admin user:', ADMIN_EMAIL);
  } else {
    await prisma.users.update({
      where: { email: ADMIN_EMAIL },
      data: { hashPassword: hashAdmin, organizationId: orgId },
    });
    console.log('Updated Admin password for:', ADMIN_EMAIL);
  }

  // 5. Scrap categories and names
  const categoryIds: Record<string, string> = {};
  for (const cat of SCRAP_CATEGORIES) {
    let existing = await prisma.scrap_categories.findFirst({
      where: { organizationId: orgId, name: cat.name },
    });
    if (!existing) {
      existing = await prisma.scrap_categories.create({
        data: {
          name: cat.name,
          description: cat.description ?? null,
          organizationId: orgId,
          isActive: true,
        },
      });
      console.log('Created scrap category:', cat.name);
    }
    categoryIds[cat.name] = existing.id;
  }

  for (const [catName, names] of Object.entries(SCRAP_NAMES)) {
    const catId = categoryIds[catName];
    if (!catId) continue;
    for (const n of names) {
      const exists = await prisma.scrap_names.findFirst({
        where: { scrapCategoryId: catId, organizationId: orgId, name: n },
      });
      if (!exists) {
        await prisma.scrap_names.create({
          data: { name: n, scrapCategoryId: catId, organizationId: orgId, isActive: true },
        });
      }
    }
  }
  console.log('Scrap names seeded for all categories.');

  // 6. Vehicle types (org scoped)
  const vehicleTypeIds: Record<string, number> = {};
  for (const vt of VEHICLE_TYPES) {
    let existing = await prisma.vehicle_types.findFirst({
      where: { name: vt.name, organizationId: orgId },
    });
    if (!existing) {
      existing = await prisma.vehicle_types.create({
        data: { name: vt.name, icon: vt.icon ?? null, organizationId: orgId, isActive: true },
      });
    }
    vehicleTypeIds[vt.name] = existing.id;
  }

  // 7. Cities
  const cityIds: Record<string, number> = {};
  for (const c of AU_CITIES) {
    let city = await prisma.cities.findUnique({ where: { name: c.name } });
    if (!city) {
      city = await prisma.cities.create({
        data: { name: c.name, latitude: c.latitude, longitude: c.longitude, isActive: true },
      });
    }
    cityIds[c.name] = city.id;
  }

  // 8. Scrap yards
  const scrapYardsData = [
    { yardName: 'Sydney Metal Recycling', address: '45 Botany Road, Alexandria NSW 2015', city: 'Sydney', lat: -33.9056, lng: 151.1936 },
    { yardName: 'Melbourne Scrap Co', address: '120 Somerville Road, Tottenham VIC 3012', city: 'Melbourne', lat: -37.7742, lng: 144.8486 },
    { yardName: 'Brisbane Scrap Yard', address: '88 Boundary Road, Richlands QLD 4077', city: 'Brisbane', lat: -27.5833, lng: 152.9833 },
  ];
  const scrapYardIds: string[] = [];
  for (const sy of scrapYardsData) {
    let yard = await prisma.scrap_yards.findFirst({
      where: { organizationId: orgId, yardName: sy.yardName },
    });
    if (!yard) {
      yard = await prisma.scrap_yards.create({
        data: {
          yardName: sy.yardName,
          address: sy.address,
          latitude: sy.lat,
          longitude: sy.lng,
          organizationId: orgId,
          isActive: true,
          operatingHours: { weekdays: '7:00–17:00', saturday: '8:00–12:00' },
        },
      });
      console.log('Created scrap yard:', sy.yardName);
    }
    scrapYardIds.push(yard.id);
  }

  // 9. Vehicle names (linked to vehicle type and optional scrap yard)
  const vehicleNameIds: string[] = [];
  for (const vn of VEHICLE_NAMES) {
    const vtId = vehicleTypeIds[vn.vehicleType];
    if (!vtId) continue;
    let existing = await prisma.vehicle_names.findFirst({
      where: { name: vn.name, vehicleTypeId: vtId, organizationId: orgId },
    });
    if (!existing) {
      existing = await prisma.vehicle_names.create({
        data: {
          name: vn.name,
          vehicleTypeId: vtId,
          organizationId: orgId,
          make: vn.make ?? null,
          model: vn.model ?? null,
          isActive: true,
          scrapYardId: scrapYardIds[0] ?? null,
        },
      });
      vehicleNameIds.push(existing.id);
    }
  }

  // 10. Crews
  let crew1 = await prisma.crews.findFirst({ where: { organizationId: orgId, name: 'Sydney North Crew' } });
  if (!crew1) {
    crew1 = await prisma.crews.create({
      data: { name: 'Sydney North Crew', description: 'Sydney northern suburbs', organizationId: orgId, isActive: true },
    });
  }
  let crew2 = await prisma.crews.findFirst({ where: { organizationId: orgId, name: 'Melbourne Metro Crew' } });
  if (!crew2) {
    crew2 = await prisma.crews.create({
      data: { name: 'Melbourne Metro Crew', description: 'Melbourne metro area', organizationId: orgId, isActive: true },
    });
  }

  // 11. Employees (including collectors) - Australian names, mobile numbers
  const employeeData = [
    { fullName: 'Jake Mitchell', email: 'jake.mitchell@aussiescrapx.com.au', phone: '0412 345 678', role: 'Collector', crewId: crew1.id },
    { fullName: 'Charlotte Taylor', email: 'charlotte.taylor@aussiescrapx.com.au', phone: '0423 456 789', role: 'Collector', crewId: crew1.id },
    { fullName: 'Liam O\'Brien', email: 'liam.obrien@aussiescrapx.com.au', phone: '0434 567 890', role: 'Collector', crewId: crew2.id },
    { fullName: 'Emma Wilson', email: 'emma.wilson@aussiescrapx.com.au', phone: '0445 678 901', role: 'Collector', crewId: crew2.id },
    { fullName: 'Oliver Nguyen', email: 'oliver.nguyen@aussiescrapx.com.au', phone: '0456 789 012', role: 'Supervisor', crewId: null },
    { fullName: 'Sophie Davis', email: 'sophie.davis@aussiescrapx.com.au', phone: '0467 890 123', role: 'Accountant', crewId: null },
  ];
  const collectorPasswordHash = await bcrypt.hash('Collector@123', 10);
  const employeeIds: string[] = [];
  for (const emp of employeeData) {
    let e = await prisma.employee.findFirst({
      where: { organizationId: orgId, email: emp.email },
    });
    if (!e) {
      e = await prisma.employee.create({
        data: {
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone.replace(/\s/g, ''),
          passwordHash: collectorPasswordHash,
          roleId: roles[emp.role].id,
          organizationId: orgId,
          isActive: true,
          completedPickups: Math.floor(Math.random() * 50) + 5,
          rating: 4 + Math.random(),
          crewId: emp.crewId,
          scrapYardId: emp.role === 'Collector' ? scrapYardIds[0] : null,
          cityId: cityIds['Sydney'] ?? undefined,
        },
      });
      console.log('Created employee:', emp.fullName, `(${emp.role})`);
      employeeIds.push(e.id);
    }
  }

  const collectors = await prisma.employee.findMany({
    where: { organizationId: orgId, roleId: roles['Collector'].id },
  });
  const collectorIds = collectors.map((c) => c.id);

  // 12. Customers - Australian names and addresses
  const customerData = [
    { name: 'James Wilson', phone: '0411 222 333', email: 'james.wilson@gmail.com', address: '12 Harbour View Dr, Mosman NSW 2088', lat: -33.829, lng: 151.239 },
    { name: 'Olivia Smith', phone: '0422 333 444', email: 'olivia.smith@outlook.com', address: '8 Chapel St, St Kilda VIC 3182', lat: -37.867, lng: 144.980 },
    { name: 'William Brown', phone: '0433 444 555', email: 'william.brown@bigpond.com', address: '45 Queen St, Brisbane City QLD 4000', lat: -27.470, lng: 153.025 },
    { name: 'Ava Jones', phone: '0444 555 666', email: 'ava.jones@yahoo.com.au', address: '22 Hay St, Subiaco WA 6008', lat: -31.946, lng: 115.823 },
    { name: 'Noah Williams', phone: '0455 666 777', email: 'noah.w@live.com.au', address: '15 Rundle St, Adelaide SA 5000', lat: -34.921, lng: 138.599 },
    { name: 'Mia Martin', phone: '0466 777 888', email: 'mia.martin@gmail.com', address: '78 Hunter St, Newcastle NSW 2300', lat: -32.928, lng: 151.782 },
    { name: 'Lucas Anderson', phone: '0477 888 999', email: 'lucas.a@optusnet.com.au', address: '5 Griffith St, Coolangatta QLD 4225', lat: -28.167, lng: 153.539 },
    { name: 'Isabella Thompson', phone: '0488 999 000', email: 'isabella.t@gmail.com', address: '42 Crown St, Wollongong NSW 2500', lat: -34.428, lng: 150.893 },
  ];
  const customerIds: string[] = [];
  for (const c of customerData) {
    let cust = await prisma.customer.findFirst({
      where: { organizationId: orgId, email: c.email },
    });
    if (!cust) {
      cust = await prisma.customer.create({
        data: {
          name: c.name,
          phone: c.phone.replace(/\s/g, ''),
          email: c.email,
          address: c.address,
          latitude: c.lat,
          longitude: c.lng,
          organizationId: orgId,
          accountStatus: 'ACTIVE',
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          vehicleYear: 2015,
          vehicleType: 'CAR',
          vehicleCondition: 'DAMAGED',
        },
      });
      customerIds.push(cust.id);
    }
  }

  const existingCustomers = await prisma.customer.findMany({ where: { organizationId: orgId } });

  // 13. Leads - Australian leads, mix of statuses
  const leadData = [
    { fullName: 'Ethan White', phone: '0499 111 222', email: 'ethan.white@gmail.com', status: 'CONVERTED' as const, address: '3 Pacific Hwy, North Sydney NSW 2060', vehicle: { make: 'Holden', model: 'Commodore', year: 2012 }, condition: 'WRECKED' as const },
    { fullName: 'Charlotte Green', phone: '0500 222 333', email: 'charlotte.g@outlook.com', status: 'QUOTED' as const, address: '56 Smith St, Collingwood VIC 3066', vehicle: { make: 'Ford', model: 'Falcon', year: 2010 }, condition: 'JUNK' as const },
    { fullName: 'Mason Harris', phone: '0511 333 444', email: 'mason.harris@bigpond.com', status: 'NEW' as const, address: '88 Ann St, Brisbane QLD 4000', vehicle: { make: 'Toyota', model: 'Corolla', year: 2015 }, condition: 'DAMAGED' as const },
    { fullName: 'Amelia Clark', phone: '0522 444 555', email: 'amelia.clark@gmail.com', status: 'CONTACTED' as const, address: '21 Murray St, Perth WA 6000', vehicle: { make: 'Mazda', model: '3', year: 2018 }, condition: 'ACCIDENTAL' as const },
    { fullName: 'Henry Lewis', phone: '0533 555 666', email: 'henry.lewis@yahoo.com.au', status: 'NEW' as const, address: '7 King William St, Adelaide SA 5000', vehicle: { make: 'Hyundai', model: 'i30', year: 2016 }, condition: 'FULLY_SCRAP' as const },
  ];
  const leadIds: string[] = [];
  for (const l of leadData) {
    const existingLead = await prisma.lead.findFirst({
      where: { organizationId: orgId, fullName: l.fullName, phone: l.phone.replace(/\s/g, '') },
    });
    if (!existingLead) {
      const lead = await prisma.lead.create({
        data: {
          organizationId: orgId,
          fullName: l.fullName,
          phone: l.phone.replace(/\s/g, ''),
          email: l.email,
          locationAddress: l.address,
          leadSource: 'WEBFORM',
          status: l.status,
          vehicleType: 'CAR',
          vehicleMake: l.vehicle.make,
          vehicleModel: l.vehicle.model,
          vehicleYear: l.vehicle.year,
          vehicleCondition: l.condition,
          notes: 'Interested in scrap quote.',
        },
      });
      leadIds.push(lead.id);
    }
  }

  const allLeads = await prisma.lead.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });

  // 14. Orders - link some to customers and converted leads
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 14);
  let orderSeq = 1;
  const orderCreateData = [
    { customerName: 'James Wilson', address: '12 Harbour View Dr, Mosman NSW 2088', leadId: allLeads.find((l) => l.status === 'CONVERTED')?.id, collectorId: collectorIds[0], yardId: scrapYardIds[0], daysAgo: 12, status: 'COMPLETED' as const, paymentStatus: 'PAID' as const },
    { customerName: 'Olivia Smith', address: '8 Chapel St, St Kilda VIC 3182', leadId: null, collectorId: collectorIds[1], yardId: scrapYardIds[1], daysAgo: 10, status: 'COMPLETED' as const, paymentStatus: 'PAID' as const },
    { customerName: 'William Brown', address: '45 Queen St, Brisbane City QLD 4000', leadId: null, collectorId: collectorIds[2], yardId: scrapYardIds[2], daysAgo: 7, status: 'IN_PROGRESS' as const, paymentStatus: 'UNPAID' as const },
    { customerName: 'Ava Jones', address: '22 Hay St, Subiaco WA 6008', leadId: null, collectorId: collectorIds[0], yardId: scrapYardIds[0], daysAgo: 5, status: 'ASSIGNED' as const, paymentStatus: 'UNPAID' as const },
    { customerName: 'Noah Williams', address: '15 Rundle St, Adelaide SA 5000', leadId: null, collectorId: null, yardId: null, daysAgo: 2, status: 'PENDING' as const, paymentStatus: 'UNPAID' as const },
  ];
  const orderIds: string[] = [];
  for (const o of orderCreateData) {
    const customer = existingCustomers.find((c) => c.name === o.customerName);
    const customerId = customer?.id ?? null;
    const createdAt = new Date(baseDate);
    createdAt.setDate(createdAt.getDate() + (14 - o.daysAgo));
    const pickupTime = new Date(createdAt);
    pickupTime.setHours(10, 0, 0, 0);
    const orderNumber = generateOrderNumber(createdAt, orderSeq++);
    const vehicleDetails = { make: 'Toyota', model: 'Camry', year: 2015, condition: 'DAMAGED', description: 'Sedan, not running' };
    const existingOrder = await prisma.order.findFirst({
      where: { organizationId: orgId, orderNumber },
    });
    if (!existingOrder) {
      const order = await prisma.order.create({
        data: {
          organizationId: orgId,
          orderNumber,
          customerName: o.customerName,
          customerEmail: customer?.email ?? `${o.customerName.toLowerCase().replace(/\s/g, '.')}@example.com`,
          address: o.address,
          latitude: -33.87,
          longitude: 151.21,
          vehicleDetails,
          orderStatus: o.status,
          paymentStatus: o.paymentStatus,
          pickupTime,
          quotedPrice: 850,
          actualPrice: o.status === 'COMPLETED' ? 820 : null,
          customerId: customerId ?? undefined,
          leadId: o.leadId ?? undefined,
          assignedCollectorId: o.collectorId ?? undefined,
          yardId: o.yardId ?? undefined,
        },
      });
      orderIds.push(order.id);

      if (o.status === 'COMPLETED' && o.paymentStatus === 'PAID' && customerId) {
        await prisma.payment.create({
          data: {
            organizationId: orgId,
            orderId: order.id,
            customerId,
            amount: 820,
            paymentType: 'CASH',
            status: 'PAID',
            collectorId: o.collectorId ?? undefined,
          },
        });
      }
    }
  }
  console.log('Orders and payments seeded.');

  // 15. Collector assignments (collector + vehicle name + city/yard)
  for (let i = 0; i < Math.min(collectorIds.length, vehicleNameIds.length); i++) {
    const collectorId = collectorIds[i];
    const vehicleNameId = vehicleNameIds[i % vehicleNameIds.length];
    const cityId = cityIds[AU_CITIES[i % AU_CITIES.length].name];
    const scrapYardId = scrapYardIds[i % scrapYardIds.length];
    const exists = await prisma.collector_assignments.findFirst({
      where: { organizationId: orgId, collectorId, vehicleNameId },
    });
    if (!exists) {
      await prisma.collector_assignments.create({
        data: {
          organizationId: orgId,
          collectorId,
          vehicleNameId,
          cityId,
          scrapYardId,
          isActive: true,
        },
      });
    }
  }
  console.log('Collector assignments seeded.');

  console.log('\n========== SEED COMPLETE ==========');
  console.log('ORGANIZATION:', ORG_NAME);
  console.log('Admin login (dashboard):');
  console.log('  Email:   ', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('Collector app login (same for all collectors):');
  console.log('  Email:   jake.mitchell@aussiescrapx.com.au (or any collector email)');
  console.log('  Password: Collector@123');
  console.log('====================================\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
