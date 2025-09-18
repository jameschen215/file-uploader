import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';

import { SALT_ROUND } from '../lib/constants';
import prisma from '../lib/prisma';
import { CreateUserType, PublicUserType } from '../types';
import passport from 'passport';

export const signUpNewUser: RequestHandler = async (req, res, next) => {
	const { email, password }: CreateUserType = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

		const newUser = await prisma.user.create({
			data: { email, password: hashedPassword },
		});

		res
			.status(201)
			.json({ message: `User ${newUser.email} is created successfully` });
	} catch (error) {
		next(error);
	}
};

export const signInUser: RequestHandler = async (req, res, next) => {
	passport.authenticate(
		'local',
		(error: Error, user: PublicUserType, info: { message?: string }) => {
			if (error) return next(error);

			// login failed
			if (!user) {
				return res
					.status(401)
					.json({ message: info.message || 'Invalid email or password' });
			}

			// login user manually
			req.logIn(user, (error) => {
				if (error) {
					return res
						.status(500)
						.json({ message: 'Login failed. Please try again' });
				}

				res.json({ message: 'You are signed in successfully' });
			});
		}
	)(req, res, next);
};

export const upgradeUser: RequestHandler = async (req, res, next) => {};

export const signOutUser: RequestHandler = async (req, res, next) => {
	req.logOut((error) => {
		if (error) return next(error);

		res.json({ message: 'You are signed out' });
	});
};
