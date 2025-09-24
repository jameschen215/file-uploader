import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import prisma from '../../lib/prisma.js';

export const localStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email: string, password: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return done(null, false, { message: 'No user found with this email' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }

      // remove password before returning user
      const { password: _, ...publicUser } = user;
      return done(null, publicUser);
    } catch (error) {
      done(error);
    }
  },
);
