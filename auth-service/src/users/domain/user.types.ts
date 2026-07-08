import { UserGender } from './user-gender.enum';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthUserRecord extends PublicUser {
  password: string;
}

export interface UserProfileData {
  bio: string | null;
  age: number | null;
  gender: UserGender | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface UserPhotoData {
  id: number;
  userId: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface UserInterestData {
  id: number;
  name: string;
}

export interface UserProfileView extends PublicUser {
  profile: UserProfileData | null;
  photos: UserPhotoData[];
  interests: UserInterestData[];
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UpdateProfileInput {
  bio?: string;
  age?: number;
  gender?: UserGender;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddPhotoInput {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}
