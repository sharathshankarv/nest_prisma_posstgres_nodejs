import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedRoles() {
  console.log('🌱 Seeding roles...');

  const roles = [
    { name: 'USER', description: 'Regular user' },
    { name: 'ADMIN', description: 'System administrator' },
    { name: 'SPECIAL', description: 'Special privileged user' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name }, // unique constraint
      update: {}, // do nothing if exists
      create: role, // create if not exists
    });
  }

  console.log('✅ Roles seeded');
}

async function seedUsers() {
  console.log('🌱 Seeding users...');

  // Fetch roles (needed for roleId)
  const userRole = await prisma.role.findUnique({
    where: { name: 'USER' },
  });

  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!userRole || !adminRole) {
    throw new Error('Roles must be seeded before users');
  }

  // Common password for all seeded users
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const users = [
    {
      firstName: 'Sharath',
      lastName: 'Shankar',
      email: 'sharath@example.com',
      phone: '9999999991',
      passwordHash,
      roleId: adminRole.id,
    },
    {
      firstName: 'Ravi',
      lastName: 'Kumar',
      email: 'ravi@example.com',
      phone: '9999999992',
      passwordHash,
      roleId: userRole.id,
    },
    {
      firstName: 'Anita',
      lastName: 'Sharma',
      email: 'anita@example.com',
      phone: '9999999993',
      passwordHash,
      roleId: userRole.id,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9999999994',
      passwordHash,
      roleId: userRole.id,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email }, // email is unique
      update: {}, // don't overwrite existing users
      create: user,
    });
  }

  console.log('✅ Users seeded');
}

async function main() {
  await seedRoles();
  await seedUsers();
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
