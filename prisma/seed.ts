import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { SALT_ROUND } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  // Your seed data here
  const users = [
    { email: 'alice@odin.com', name: 'Alice Johnson', password: '123456' },
    { email: 'bob@odin.com', name: 'Bob Smith', password: '123456' },
  ];

  // Hash all passwords first
  const usersWithHashedPasswords = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, SALT_ROUND),
    })),
  );

  // Create and return users
  const newUsers = await prisma.user.createManyAndReturn({
    data: usersWithHashedPasswords,
  });

  console.log('Created users: ', newUsers);
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
