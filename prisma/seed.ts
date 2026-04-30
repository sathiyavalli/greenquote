import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  await prisma.offer.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create test users
  const userPassword = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@test.com',
      password: userPassword,
      fullName: 'John Doe',
      role: 'user',
    },
  });

  const _user2 = await prisma.user.create({
    data: {
      email: 'user2@test.com',
      password: userPassword,
      fullName: 'Jane Smith',
      role: 'user',
    },
  });

  console.log('✅ Created test users');

  // Create test quotes for user1
  const _quote1 = await prisma.quote.create({
    data: {
      userId: user1.id,
      fullName: 'John Doe',
      address: '123 Solar Street, Berlin',
      monthlyConsumptionKwh: 500,
      systemSizeKw: 5,
      downPayment: 5000,
      systemPrice: 6000, // 5 * 1200
      principalAmount: 1000, // 6000 - 5000
      riskBand: 'A',
      offers: {
        createMany: {
          data: [
            {
              termYears: 5,
              apr: 0.069,
              principalUsed: 1000,
              monthlyPayment: 18.87,
            },
            {
              termYears: 10,
              apr: 0.069,
              principalUsed: 1000,
              monthlyPayment: 9.98,
            },
            {
              termYears: 15,
              apr: 0.069,
              principalUsed: 1000,
              monthlyPayment: 7.12,
            },
          ],
        },
      },
    },
  });

  console.log('✅ Created test quote with offers');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
