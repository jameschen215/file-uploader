import session from 'express-session';
import { PrismaClient } from '@prisma/client/index.js';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

export function configureSession() {
  return session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 1000 * 60 * 2,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  });
}
