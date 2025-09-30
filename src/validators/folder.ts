import { checkSchema } from 'express-validator';

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
      options: (value) => {
        if (!/^[A-Za-z0-9_-]{1,20}$/.test(value)) {
          throw new Error('Invalid folder name');
        }

        return true;
      },
    },
  },
});
