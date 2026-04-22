import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersRepositoryPort } from '../domain/users.repository.port';
import { UserGender } from '../domain/user-gender.enum';
import {
  AddPhotoInput,
  AuthUserRecord,
  CreateUserInput,
  PublicUser,
  UpdateProfileInput,
  UserPhotoData,
  UserProfileView,
} from '../domain/user.types';

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
} as const;

const PROFILE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  profile: true,
  photos: {
    orderBy: { sortOrder: 'asc' },
  },
  interests: {
    select: {
      interest: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      interest: { name: 'asc' },
    },
  },
} as const;

@Injectable()
export class PrismaUsersRepository implements UsersRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findAllPublicUsers(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({ select: PUBLIC_USER_SELECT });
  }

  findUserByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });
  }

  findPublicUserById(id: number): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });
  }

  async getUserProfileById(userId: number): Promise<UserProfileView | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_USER_SELECT,
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile
        ? {
            bio: user.profile.bio,
            age: user.profile.age,
            gender: user.profile.gender as UserGender | null,
            city: user.profile.city,
            country: user.profile.country,
            latitude: user.profile.latitude
              ? Number(user.profile.latitude)
              : null,
            longitude: user.profile.longitude
              ? Number(user.profile.longitude)
              : null,
          }
        : null,
      photos: user.photos,
      interests: user.interests.map(({ interest }) => interest),
    };
  }

  createUser(data: CreateUserInput): Promise<PublicUser> {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
      },
      select: PUBLIC_USER_SELECT,
    });
  }

  upsertProfile(userId: number, data: UpdateProfileInput): Promise<void> {
    return this.prisma.userProfile
      .upsert({
        where: { userId },
        create: {
          userId,
          bio: data.bio,
          age: data.age,
          gender: data.gender,
          city: data.city,
          country: data.country,
          latitude:
            data.latitude !== undefined ? new Prisma.Decimal(data.latitude) : null,
          longitude:
            data.longitude !== undefined
              ? new Prisma.Decimal(data.longitude)
              : null,
        },
        update: {
          bio: data.bio,
          age: data.age,
          gender: data.gender,
          city: data.city,
          country: data.country,
          latitude:
            data.latitude !== undefined
              ? new Prisma.Decimal(data.latitude)
              : undefined,
          longitude:
            data.longitude !== undefined
              ? new Prisma.Decimal(data.longitude)
              : undefined,
        },
      })
      .then(() => undefined);
  }

  async userExists(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return Boolean(user);
  }

  countUserPhotos(userId: number): Promise<number> {
    return this.prisma.userPhoto.count({
      where: { userId },
    });
  }

  async findLastPhotoSortOrder(userId: number): Promise<number | null> {
    const photo = await this.prisma.userPhoto.findFirst({
      where: { userId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return photo?.sortOrder ?? null;
  }

  resetPrimaryPhotos(userId: number): Promise<void> {
    return this.prisma.userPhoto
      .updateMany({
        where: { userId },
        data: { isPrimary: false },
      })
      .then(() => undefined);
  }

  createPhoto(userId: number, data: AddPhotoInput): Promise<UserPhotoData> {
    return this.prisma.userPhoto.create({
      data: {
        userId,
        url: data.url,
        isPrimary: data.isPrimary,
        sortOrder: data.sortOrder,
      },
    });
  }

  findPhotoByIdForUser(
    userId: number,
    photoId: number,
  ): Promise<UserPhotoData | null> {
    return this.prisma.userPhoto.findFirst({
      where: { id: photoId, userId },
    });
  }

  deletePhoto(photoId: number): Promise<void> {
    return this.prisma.userPhoto.delete({ where: { id: photoId } }).then(() => undefined);
  }

  findFirstPhoto(userId: number): Promise<UserPhotoData | null> {
    return this.prisma.userPhoto.findFirst({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  setPhotoPrimary(photoId: number): Promise<void> {
    return this.prisma.userPhoto
      .update({
        where: { id: photoId },
        data: { isPrimary: true },
      })
      .then(() => undefined);
  }

  async replaceUserInterests(userId: number, interests: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.interest.createMany({
        data: interests.map((name) => ({ name })),
        skipDuplicates: true,
      });

      const foundInterests = await tx.interest.findMany({
        where: { name: { in: interests } },
        select: { id: true },
      });

      await tx.userInterest.deleteMany({
        where: { userId },
      });

      await tx.userInterest.createMany({
        data: foundInterests.map((interest) => ({
          userId,
          interestId: interest.id,
        })),
      });
    });
  }
}
