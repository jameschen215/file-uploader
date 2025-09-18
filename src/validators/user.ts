import { checkSchema } from 'express-validator';
import prisma from '../lib/prisma';

export const signUpSchema = checkSchema({
	// validate email
	email: {
		in: ['body'],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: 'Email is required',
		},
		isEmail: {
			errorMessage: 'Invalid email format',
		},
		normalizeEmail: true,
		custom: {
			options: async (value) => {
				const user = await prisma.user.findUnique({ where: { email: value } });
				if (user) {
					throw new Error('An account with this email already exists');
				}

				return true;
			},
		},
	},

	// validate password
	password: {
		in: ['body'],
		isString: true,
		notEmpty: {
			errorMessage: 'Password is required',
		},
		isLength: {
			options: { min: 6 },
			errorMessage: 'Password must be at least 6 characters long',
		},
	},

	// validate confirm_password
	confirm_password: {
		in: ['body'],
		isString: true,
		notEmpty: {
			errorMessage: 'Confirm password is required',
		},
		custom: {
			options: (value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Passwords do not match');
				}

				return true;
			},
		},
	},
});

export const signInSchema = checkSchema({
	// validate email
	email: {
		in: ['body'],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: 'Email is required',
		},
		isEmail: {
			errorMessage: 'Invalid email format',
		},
		normalizeEmail: true,
	},

	// validate password
	password: {
		in: ['body'],
		isString: true,
		notEmpty: {
			errorMessage: 'Password is required',
		},
	},
});
