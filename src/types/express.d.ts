import { PublicUserType } from './user.ts';

declare global {
  namespace Express {
    interface Locals {
      currentUser?: PublicUserType;
    }
  }
}
