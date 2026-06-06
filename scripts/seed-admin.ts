import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient as AuthPrismaClient } from '../generated/prisma/auth';
import { PrismaClient as UsersPrismaClient } from '../generated/prisma/users';
import { Permissions, Roles } from '../src/auth/rbac.constants';

function getConnectionString(primaryName: string): string {
  const connectionString =
    process.env[primaryName] ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(`${primaryName} or DATABASE_URL is required.`);
  }

  return connectionString;
}

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error('Usage: npm run rbac:seed-admin -- user@example.com');
  }

  const usersPool = new Pool({
    connectionString: getConnectionString('USERS_DATABASE_URL'),
  });
  const authPool = new Pool({
    connectionString: getConnectionString('AUTH_DATABASE_URL'),
  });
  const usersPrisma = new UsersPrismaClient({
    adapter: new PrismaPg(usersPool),
  });
  const authPrisma = new AuthPrismaClient({
    adapter: new PrismaPg(authPool),
  });

  try {
    const user = await usersPrisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new Error(`User not found: ${email}`);
    }

    await authPrisma.$transaction(async (tx) => {
      const userRole = await tx.role.upsert({
        where: { name: Roles.user },
        create: { name: Roles.user },
        update: {},
        select: { id: true },
      });
      const adminRole = await tx.role.upsert({
        where: { name: Roles.admin },
        create: { name: Roles.admin },
        update: {},
        select: { id: true },
      });
      const usersListPermission = await tx.permission.upsert({
        where: { name: Permissions.usersList },
        create: { name: Permissions.usersList },
        update: {},
        select: { id: true },
      });

      await tx.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: usersListPermission.id,
          },
        },
        create: {
          roleId: adminRole.id,
          permissionId: usersListPermission.id,
        },
        update: {},
      });

      for (const roleId of [userRole.id, adminRole.id]) {
        await tx.userRole.upsert({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId,
            },
          },
          create: {
            userId: user.id,
            roleId,
          },
          update: {},
        });
      }
    });

    console.log(`Assigned ADMIN role to ${user.email}. Log in again.`);
  } finally {
    await usersPrisma.$disconnect();
    await authPrisma.$disconnect();
    await usersPool.end();
    await authPool.end();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
