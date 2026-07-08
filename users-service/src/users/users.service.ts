import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AddPhotoDto } from './dto/add-photo.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { USERS_REPOSITORY } from './domain/users.repository.port';
import type { UsersRepositoryPort } from './domain/users.repository.port';
import { SetInterestsDto } from './dto/set-interests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryPort,
  ) {}

  findAll() {
    return this.usersRepository.findAllPublicUsers();
  }

  async findByEmailForAuth(email: string) {
    return this.usersRepository.findUserByEmail(email.toLowerCase());
  }

  async getProfileById(userId: number) {
    const user = await this.usersRepository.getUserProfileById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  findById(id: number) {
    return this.usersRepository.findPublicUserById(id);
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.usersRepository.createUser({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: hashedPassword,
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.ensureUserExists(userId);

    await this.usersRepository.upsertProfile(userId, dto);

    return this.getProfileById(userId);
  }

  async addPhoto(userId: number, dto: AddPhotoDto) {
    await this.ensureUserExists(userId);

    const photosCount = await this.usersRepository.countUserPhotos(userId);

    if (photosCount >= 9) {
      throw new UnprocessableEntityException(
        'Photo limit reached. Max 9 photos.',
      );
    }

    const lastSortOrder = await this.usersRepository.findLastPhotoSortOrder(userId);

    const shouldBePrimary = dto.isPrimary ?? photosCount === 0;

    if (shouldBePrimary) {
      await this.usersRepository.resetPrimaryPhotos(userId);
    }

    return this.usersRepository.createPhoto(userId, {
      url: dto.url,
      isPrimary: shouldBePrimary,
      sortOrder: (lastSortOrder ?? -1) + 1,
    });
  }

  async removePhoto(userId: number, photoId: number) {
    const photo = await this.usersRepository.findPhotoByIdForUser(userId, photoId);

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.usersRepository.deletePhoto(photoId);

    if (photo.isPrimary) {
      const firstPhoto = await this.usersRepository.findFirstPhoto(userId);

      if (firstPhoto) {
        await this.usersRepository.setPhotoPrimary(firstPhoto.id);
      }
    }

    return { success: true };
  }

  async setInterests(userId: number, dto: SetInterestsDto) {
    await this.ensureUserExists(userId);

    const cleaned = [...new Set(dto.interests.map((name) => name.trim()))].filter(
      Boolean,
    );

    if (cleaned.length === 0) {
      throw new UnprocessableEntityException('At least one interest is required');
    }

    await this.usersRepository.replaceUserInterests(userId, cleaned);

    return this.getProfileById(userId);
  }

  private async ensureUserExists(userId: number) {
    const exists = await this.usersRepository.userExists(userId);
    if (!exists) {
      throw new NotFoundException('User not found');
    }
  }
}
