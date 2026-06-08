import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  console.log("Testing Prisma...");

  const users = await prisma.user.findMany({
    take: 3,
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(users);
} catch (err) {
  console.error(err);
} finally {
  await prisma.$disconnect();
}