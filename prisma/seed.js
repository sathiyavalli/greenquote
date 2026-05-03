const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.offer.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.user.deleteMany();

  // Admin user
  const adminPassword = await bcrypt.hash('AdminPass123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Test user 1
  const user1Password = await bcrypt.hash('UserPass456!', 12);
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: user1Password,
      fullName: 'John Doe',
      role: 'user',
    },
  });
  console.log('✅ Test user 1 created:', user1.email);

  // Test user 2
  const user2Password = await bcrypt.hash('UserPass789!', 12);
  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: user2Password,
      fullName: 'Jane Smith',
      role: 'user',
    },
  });
  console.log('✅ Test user 2 created:', user2.email);

  // Create sample quotes for user 1 (Band A: high consumption, smaller system)
  const quote1 = await prisma.quote.create({
    data: {
      userId: user1.id,
      fullName: 'John Doe',
      address: '123 Main St, Austin, TX 78701',
      monthlyConsumptionKwh: 850,
      systemSizeKw: 7,
      downPayment: 5000,
      systemPrice: 8400, // 7 * 1200
      principalAmount: 3400, // 8400 - 5000
      riskBand: 'A',
      status: 'pending',
    },
  });

  // Add offers for quote 1
  await prisma.offer.createMany({
    data: [
      { quoteId: quote1.id, termYears: 5, apr: 6.9, principalUsed: 3400, monthlyPayment: 63.54 },
      { quoteId: quote1.id, termYears: 10, apr: 6.9, principalUsed: 3400, monthlyPayment: 35.89 },
      { quoteId: quote1.id, termYears: 15, apr: 6.9, principalUsed: 3400, monthlyPayment: 26.66 },
    ],
  });
  console.log('✅ Quote 1 (Band A) created for John Doe with 3 offers');

  // Create sample quote for user 1 (Band C: low consumption)
  const quote2 = await prisma.quote.create({
    data: {
      userId: user1.id,
      fullName: 'John Doe',
      address: '456 Oak Ave, Austin, TX 78702',
      monthlyConsumptionKwh: 200,
      systemSizeKw: 3,
      downPayment: 2000,
      systemPrice: 3600, // 3 * 1200
      principalAmount: 1600, // 3600 - 2000
      riskBand: 'C',
      status: 'approved',
    },
  });

  // Add offers for quote 2
  await prisma.offer.createMany({
    data: [
      { quoteId: quote2.id, termYears: 5, apr: 11.9, principalUsed: 1600, monthlyPayment: 32.87 },
      { quoteId: quote2.id, termYears: 10, apr: 11.9, principalUsed: 1600, monthlyPayment: 20.37 },
      { quoteId: quote2.id, termYears: 15, apr: 11.9, principalUsed: 1600, monthlyPayment: 15.74 },
    ],
  });
  console.log('✅ Quote 2 (Band C) created for John Doe with 3 offers');

  // Create sample quote for user 2 (Band B: medium consumption)
  const quote3 = await prisma.quote.create({
    data: {
      userId: user2.id,
      fullName: 'Jane Smith',
      address: '789 Pine Rd, Seattle, WA 98101',
      monthlyConsumptionKwh: 600,
      systemSizeKw: 5,
      downPayment: 3000,
      systemPrice: 6000, // 5 * 1200
      principalAmount: 3000, // 6000 - 3000
      riskBand: 'B',
    },
  });

  // Add offers for quote 3
  await prisma.offer.createMany({
    data: [
      { quoteId: quote3.id, termYears: 5, apr: 8.9, principalUsed: 3000, monthlyPayment: 62.04 },
      { quoteId: quote3.id, termYears: 10, apr: 8.9, principalUsed: 3000, monthlyPayment: 37.36 },
      { quoteId: quote3.id, termYears: 15, apr: 8.9, principalUsed: 3000, monthlyPayment: 28.57 },
    ],
  });
  console.log('✅ Quote 3 (Band B) created for Jane Smith with 3 offers');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin: admin@test.com / AdminPass123!');
  console.log('  User 1: john@example.com / UserPass456!');
  console.log('  User 2: jane@example.com / UserPass789!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
