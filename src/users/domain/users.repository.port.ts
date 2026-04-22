import {
  AddPhotoInput,
  AuthUserRecord,
  CreateUserInput,
  PublicUser,
  UpdateProfileInput,
  UserPhotoData,
  UserProfileView,
} from './user.types';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface UsersRepositoryPort {
  findAllPublicUsers(): Promise<PublicUser[]>;
  findUserByEmail(email: string): Promise<AuthUserRecord | null>;
  findPublicUserById(id: number): Promise<PublicUser | null>;
  getUserProfileById(userId: number): Promise<UserProfileView | null>;
  createUser(data: CreateUserInput): Promise<PublicUser>;
  upsertProfile(userId: number, data: UpdateProfileInput): Promise<void>;
  userExists(userId: number): Promise<boolean>;
  countUserPhotos(userId: number): Promise<number>;
  findLastPhotoSortOrder(userId: number): Promise<number | null>;
  resetPrimaryPhotos(userId: number): Promise<void>;
  createPhoto(userId: number, data: AddPhotoInput): Promise<UserPhotoData>;
  findPhotoByIdForUser(userId: number, photoId: number): Promise<UserPhotoData | null>;
  deletePhoto(photoId: number): Promise<void>;
  findFirstPhoto(userId: number): Promise<UserPhotoData | null>;
  setPhotoPrimary(photoId: number): Promise<void>;
  replaceUserInterests(userId: number, interests: string[]): Promise<void>;
}
