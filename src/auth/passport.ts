import passport from 'passport';

import prisma from '../lib/prisma.js';
import { UserType } from '../types/user.js';
import { localStrategy } from './strategies/local.js';

export function configurePassport() {
	// configure strategy
	passport.use(localStrategy);

	// serialize user for the session
	passport.serializeUser((user, done) => {
		done(null, (user as UserType).id);
	});

	// deserialize user from the session
	passport.deserializeUser(async (id, done) => {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id: id as string,
				},
			});

			if (!user) {
				return done(null, false);
			}

			return done(null, user);
		} catch (error) {
			done(error);
		}
	});

	return passport;
}
