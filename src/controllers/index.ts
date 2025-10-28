import path from 'path';
import prisma from '../lib/prisma.js';

import { asyncHandler } from '../lib/async-handler.js';
import { getHomepageData } from '../lib/index-data.js';
import { ALLOWED_FILE_TYPES } from '../lib/constants.js';
import { configureSupabase } from '../config/supabase.js';
import { throwSupabaseError } from '../lib/supabase-helpers.js';
import { CustomBadRequestError, CustomNotFoundError } from '../errors/index.js';

const supabase = configureSupabase();

export const handleGetFiles = asyncHandler(async (req, res) => {
  const query = req.query;
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'name';
  const direction =
    typeof query.sortDirection === 'string' ? query.sortDirection : 'asc';

  const data = await getHomepageData(
    res.locals.currentUser!.id,
    req.params.folderId || null,
    sortBy,
    direction,
  );

  res.render('index', {
    ...data,
    errors: null,
    oldInput: null,
    sortBy,
    direction,
  });
});

// export const getFiles: RequestHandler = async (req, res) => {
//   const query = req.query;
//   const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'name';
//   const direction =
//     typeof query.sortDirection === 'string' ? query.sortDirection : 'asc';

//   console.log({ sortBy, direction });

//   try {
//     const data = await getHomepageData(
//       res.locals.currentUser!.id,
//       req.params.folderId || null,
//       sortBy,
//       direction,
//     );

//     res.render('index', {
//       ...data,
//       errors: null,
//       oldInput: null,
//       sortBy,
//       direction,
//     });
//   } catch (error) {
//     console.error('Get folder contents error: ', error);
//     throw error;
//   }
// };

export const handleGetFileById = asyncHandler(async (req, res) => {
  const userId = res.locals.currentUser!.id;
  const { fileId } = req.params;

  const file = await prisma.file.findUnique({
    where: { id: fileId, userId },
  });

  if (!file) {
    throw new CustomNotFoundError('File not found');
  }

  // Add thumbnail URL
  // TODO:
});

export const handleUploadFiles = asyncHandler(async (req, res) => {
  // Get user and folder info
  const userId = res.locals.currentUser!.id;
  const folderId = req.params.folderId || null;

  // Verify folder ownership if specified
  if (folderId) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
  }

  // Ensure files exist
  if (!req.files) {
    throw new CustomBadRequestError('No files provided');
  }

  // Normalize req.files to an array (it can be File[] or { [fieldname: string]: File[] })
  const filesArray = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files).flat();

  if (!filesArray || filesArray.length === 0) {
    throw new CustomBadRequestError('No files provided');
  }

  // Validate file types
  const invalidTypes = filesArray
    .filter(
      (file) =>
        !ALLOWED_FILE_TYPES.some((type) => file.mimetype.startsWith(type)),
    )
    .map((file) => path.extname(file.originalname));

  if (invalidTypes.length > 0) {
    return res.status(400).json({
      error:
        'Invalid file type. Allowed formats: images, videos, PDFs, Word documents, and Excel spreadsheets.',
    });
  }

  // Process each file
  const uploadedFiles = [];

  for (const file of filesArray) {
    const fileName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;

    // SUPABASE STORAGE
    const supabasePath = `uploads/${userId}/${folderId ? `folder-${folderId}` : 'root'}/${fileName}`;

    const { error } = await supabase.storage
      .from('files')
      .upload(supabasePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throwSupabaseError(error, 'upload file');
    }

    const { data: publicUrlData } = supabase.storage
      .from('files')
      .getPublicUrl(supabasePath);

    const filePath = supabasePath;
    const publicUrl = publicUrlData.publicUrl;

    // Save file metadata to database
    const savedFile = await prisma.file.create({
      data: {
        originalName: file.originalname,
        fileName,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        publicUrl,
        userId,
        folderId,
      },
    });

    uploadedFiles.push(savedFile);
  }

  // Send success response AFTER all files processed
  res.json({
    success: true,
    message: `${uploadedFiles.length} file(s) uploaded successfully.`,
    files: uploadedFiles,
  });
});

// export const handleUploadFiles = asyncHandler(async (req, res) => {
//   upload(req, res, async (error) => {
//     // 1. handle errors
//     if (error instanceof MulterError) {
//       return res
//         .status(400)
//         .json({ error: handleMulterError(error, 'upload') });
//     } else if (error) {
//       return res.status(500).json({ error: 'Unknown error' });
//     }

//     // 2. Check if files exist
//     if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded.' });
//     }

//     // 3. Validate file types
//     const invalidTypes = req.files
//       .filter(
//         (file) =>
//           !ALLOWED_FILE_TYPES.some((type) => file.mimetype.startsWith(type)),
//       )
//       .map((file) => path.extname(file.originalname));

//     if (invalidTypes.length > 0) {
//       return res.status(400).json({
//         error:
//           'Invalid file type. Allowed formats: images, videos, PDFs, Word documents, and Excel spreadsheets.',
//       });
//     }

//     // 4. Get user and folder info
//     const userId = res.locals.currentUser!.id;
//     const folderId = req.params.folderId || null;

//     // 5. Verify folder ownership if specified
//     if (folderId) {
//       const folder = await prisma.folder.findFirst({
//         where: { id: folderId, userId },
//       });

//       if (!folder) {
//         return res.status(404).json({ error: 'Folder not found' });
//       }
//     }

//     // 6. Process each file
//     const uploadedFiles = [];

//     for (const file of req.files) {
//       const fileName =
//         Date.now() +
//         '-' +
//         Math.round(Math.random() * 1e9) +
//         '-' +
//         file.originalname;

//       let filePath = '';
//       let publicUrl = '';

//       // SUPABASE STORAGE FOR PRODUCTION
//       const supabasePath = `uploads/${userId}/${folderId ? `folder-${folderId}` : 'root'}/${fileName}`;

//       const { data, error } = await supabase.storage
//         .from('files')
//         .upload(supabasePath, file.buffer, {
//           contentType: file.mimetype,
//           upsert: false,
//         });

//       if (error) {
//         handleSupabaseError(error, 'upload file');
//       }

//       const { data: publicUrlData } = supabase.storage
//         .from('files')
//         .getPublicUrl(supabasePath);

//       filePath = supabasePath;
//       publicUrl = publicUrlData.publicUrl;

//       // 7. Save file metadata to database
//       const savedFile = await prisma.file.create({
//         data: {
//           originalName: file.originalname,
//           fileName,
//           filePath,
//           fileSize: file.size,
//           mimeType: file.mimetype,
//           publicUrl,
//           userId,
//           folderId,
//         },
//       });

//       uploadedFiles.push(savedFile);
//     }

//     // 8. Send success response and redirect AFTER all files processed
//     res.json({
//       success: true,
//       message: `${uploadedFiles.length} file(s) uploaded successfully.`,
//       files: uploadedFiles,
//     });

//     // No redirect here, (Better to let frontend handle redirect)
//   });
// });
// export const uploadFiles: RequestHandler = async (req, res) => {
//   upload(req, res, async (error) => {
//     // 1. handle Multer error
//     if (error instanceof MulterError) {
//       console.log('Error code: ', error.code, error.message);

//       switch (error.code) {
//         case 'LIMIT_FILE_SIZE':
//           return res.status(400).json({
//             error: `File too large! Maximum is ${MAX_FILE_SIZE}MB per file.`,
//           });

//         case 'LIMIT_FIELD_COUNT':
//           return res
//             .status(400)
//             .json({ error: `Too many files! Maximum is ${MAX_FILES}.` });

//         default:
//           return res.status(400).json({ error: error.message });
//       }
//     } else if (error) {
//       return res.status(500).json({ error: 'Unknown error' });
//     }

//     // 2. Check if files exist
//     if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded.' });
//     }

//     // 3. Validate file types
//     const invalidTypes = req.files
//       .filter(
//         (file) =>
//           !ALLOWED_FILE_TYPES.some((type) => file.mimetype.startsWith(type)),
//       )
//       .map((file) => path.extname(file.originalname));

//     if (invalidTypes.length > 0) {
//       return res.status(400).json({
//         message:
//           'Invalid file type. Allowed formats: images, videos, PDFs, Word documents, and Excel spreadsheets.',
//       });
//     }

//     // 4. Get user and folder info
//     const userId = res.locals.currentUser!.id;
//     const folderId = req.params.folderId || null;

//     // 5. Verify folder ownership if specified
//     if (folderId) {
//       const folder = await prisma.folder.findFirst({
//         where: { id: folderId, userId },
//       });

//       if (!folder) {
//         return res.status(404).json({ error: 'Folder not found' });
//       }
//     }

//     try {
//       const uploadedFiles = [];

//       // 6. Process each file
//       for (const file of req.files) {
//         const fileName =
//           Date.now() +
//           '-' +
//           Math.round(Math.random() * 1e9) +
//           '-' +
//           file.originalname;

//         let filePath = '';
//         let publicUrl = '';

//         if (isDev) {
//           // LOCAL STORAGE FOR DEVELOPMENT
//           const folderPath = folderId
//             ? path.join(
//                 process.cwd(),
//                 'uploads',
//                 `user-${userId}`,
//                 `folder-${folderId}`,
//               )
//             : path.join(process.cwd(), 'uploads', `user-${userId}`, 'root');

//           // Create directory if it doesn't exist
//           if (!fs.existsSync(folderPath)) {
//             fs.mkdirSync(folderPath, { recursive: true });
//           }

//           filePath = path.join(folderPath, fileName);
//           fs.writeFileSync(filePath, file.buffer);

//           // For local, use relative path as "public URL"
//           publicUrl = `uploads/user-${userId}/${folderId ? `folder-${folderId}` : 'root'}/${fileName}`;
//         } else {
//           // SUPABASE STORAGE FOR PRODUCTION
//           const supabasePath = `uploads/${userId}/${folderId ? `folder-${folderId}` : 'root'}/${fileName}`;

//           const { data, error } = await supabase.storage
//             .from('files')
//             .upload(supabasePath, file.buffer, {
//               contentType: file.mimetype,
//               upsert: false,
//             });

//           if (error) {
//             console.error('Supabase upload error: ', error);
//             return res.status(500).json({ error: 'Failed to upload file' });
//           }

//           const { data: publicUrlData } = supabase.storage
//             .from('files')
//             .getPublicUrl(supabasePath);

//           filePath = supabasePath;
//           publicUrl = publicUrlData.publicUrl;
//         }

//         // 7. Save file metadata to database
//         const savedFile = await prisma.file.create({
//           data: {
//             originalName: file.originalname,
//             fileName,
//             filePath,
//             fileSize: file.size,
//             mimeType: file.mimetype,
//             publicUrl,
//             userId,
//             folderId,
//           },
//         });

//         uploadedFiles.push(savedFile);
//       }

//       // 8. Send success response and redirect AFTER all files processed
//       res.json({
//         success: true,
//         message: `${uploadedFiles.length} file(s) uploaded successfully.`,
//         files: uploadedFiles,
//       });

//       // No redirect here, (Better to let frontend handle redirect)
//     } catch (error) {
//       console.error('Upload error: ', error);
//       res.status(500).json({ error: 'Failed to save files' });
//     }
//   });
// };
