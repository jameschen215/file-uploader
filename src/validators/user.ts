import { checkSchema } from 'express-validator';
import prisma from '../lib/prisma.js';

export const signUpSchema = checkSchema({
  // validate name
  name: {
    in: ['body'],
    isString: true,
    trim: true,
    isLength: {
      options: { max: 20 },
      errorMessage: 'Name must be at most 20 characters long.',
    },
    custom: {
      options: (value) => {
        if (value && !/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(value)) {
          throw new Error('Invalid name');
        }

        return true;
      },
    },
  },
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
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long',
    },
  },
});

export const renameSchema = checkSchema({
  name: {
    in: ['body'],
    isString: true,
    trim: true,
    isLength: {
      options: { max: 20 },
      errorMessage: 'Name must be at most 20 characters long.',
    },
    custom: {
      options: (value) => {
        if (value && !/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(value)) {
          throw new Error('Invalid name');
        }

        return true;
      },
    },
  },
});

export const updatePasswordSchema = checkSchema({
  old_password: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'Current password is required.',
    },

    // Validate correctness in controller
  },
  new_password: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'New password is required',
    },
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long',
    },
  },
  confirm_new_password: {
    in: ['body'],
    isString: true,
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.new_password) {
          throw new Error('New passwords do not match');
        }

        return true;
      },
    },
  },
});
