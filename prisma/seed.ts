import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { exit } from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const passwordHash = await hash('password123', 10);

  // 1. FREE USER
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@nexus.test' },
    update: {},
    create: {
      email: 'free@nexus.test',
      name: 'Free User',
      password: passwordHash,
      plan: 'FREE',
      trialEndsAt: null, // Expired or never started
      aiUsageCountToday: 1 // Already used 1
    },
  });

  // 2. TRIAL USER (Active)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const trialUser = await prisma.user.upsert({
    where: { email: 'trial@nexus.test' },
    update: {},
    create: {
      email: 'trial@nexus.test',
      name: 'Trial User',
      password: passwordHash,
      plan: 'TRIAL',
      trialEndsAt: tomorrow, // Ends in 24h
      aiUsageCountToday: 5
    },
  });

  // 3. PAID USER
  const paidUser = await prisma.user.upsert({
    where: { email: 'paid@nexus.test' },
    update: {},
    create: {
      email: 'paid@nexus.test',
      name: 'Paid User',
      password: passwordHash,
      plan: 'PAID',
      trialEndsAt: null,
      aiUsageCountToday: 50
    },
  });

  console.log('✅ Seed completed!');
  console.log('------------------------------------------------');
  console.log('Credentials (Password: password123)');
  console.log(`FREE:  ${freeUser.email}`);
  console.log(`TRIAL: ${trialUser.email}`);
  console.log(`PAID:  ${paidUser.email}`);
  console.log('------------------------------------------------');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    exit(1);
  });