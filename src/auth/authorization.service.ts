import { Injectable } from '@nestjs/common';
import { AuthPrismaService } from '../prisma/auth-prisma.service';
import { Roles } from './rbac.constants';

export interface AuthorizationContext {
  roles: string[];
  permissions: string[];
}

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: AuthPrismaService) {}

  async getOrCreateUserAuthorization(
    userId: number,
  ): Promise<AuthorizationContext> {
    await this.ensureDefaultUserRole(userId);

    const assignments = await this.prisma.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            name: true,
            permissions: {
              select: {
                permission: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const roles = assignments.map(({ role }) => role.name).sort();
    const permissions = [
      ...new Set(
        assignments.flatMap(({ role }) =>
          role.permissions.map(({ permission }) => permission.name),
        ),
      ),
    ].sort();

    return { roles, permissions };
  }

  private async ensureDefaultUserRole(userId: number): Promise<void> {
    const role = await this.prisma.role.upsert({
      where: { name: Roles.user },
      create: { name: Roles.user },
      update: {},
      select: { id: true },
    });

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      create: {
        userId,
        roleId: role.id,
      },
      update: {},
    });
  }
}
