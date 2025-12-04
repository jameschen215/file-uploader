import { checkSchema } from 'express-validator';
import prisma from '../lib/prisma.js';

export const folderSchema = checkSchema({
  name: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: { errorMessage: 'Folder name is required' },
    isLength: {
      options: { max: 20 },
      errorMessage: 'Folder name must be at most 20 characters long.',
    },
    custom: {
      // Mark the function as ASYNC to handle the database call
      options: async (value, { req }) => {
        if (!/^[A-Za-z0-9_-]{1,20}$/.test(value)) {
          throw new Error('Invalid folder name');
        }

        // Run the Uniqueness Check
        const { parentFolderId } = req.body;
        const userId = req.user.id;
        const existingFolder = await prisma.folder.findFirst({
          where: {
            name: value,
            userId,
            parentFolderId: parentFolderId || null,
          },
        });

        if (existingFolder) {
          throw new Error('A folder with this name already exists.');
        }

        return true;
      },
    },
  },
});
