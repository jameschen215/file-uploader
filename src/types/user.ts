import type { User } from '@prisma/client';

export type UserType = User;

export type PublicUserType = Omit<User, 'password'>;

export type CreateUserType = Omit<
  User,
  'id' | 'role' | 'createdAt' | 'updatedAt'
>;
