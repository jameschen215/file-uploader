import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import { fileURLToPath } from 'url';
import session from 'express-session';
import methodOverride from 'method-override';
import { PrismaClient } from '@prisma/client/index.js';
import expressEjsLayouts from 'express-ejs-layouts';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

import authRoutes from './routes/auth.js';
import indexRoutes from './routes/index.js';
import folderRoutes from './routes/folder.js';
import searchRoutes from './routes/search.js';

import { CustomNotFoundError } from './errors/index.js';
import { errorsHandler } from './errors/error-handler.js';
import { configurePassport } from './auth/index.js';
import { setCurrentUser } from './middlewares/set-current-user.js';
import { formatAvatar } from './middlewares/format-avatar.js';
import { getLucideIcons } from './middlewares/get-lucide-icons.js';
import { setCurrentFolder } from './middlewares/set-current-folder.js';
import { setCurrentPath } from './middlewares/set-current-path.js';
import { getFileFormatter } from './middlewares/get-formatters-for-file.js';

const app = express();

// get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// configure ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressEjsLayouts);
app.set('layout', 'layout');
app.set('view options', {
  rmWhitespace: true, // remove white spaces
  cache: process.env.NODE_ENV === 'production',
});

// Enable view caching in production to improve performance
if (process.env.NODE_ENV === 'production') {
  app.set('view cache', true);
}

// middlewares
app.use(cors());
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      imgSrc: ["'self'", 'data:', 'https://djckxvnpmjpsxsmphbqa.supabase.co'],
    },
  }),
);
app.use(morgan('dev'));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

// Serve static assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files in development only
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}

// custom middlewares
app.use(getLucideIcons);
app.use(formatAvatar);
app.use(getFileFormatter);
app.use(setCurrentPath);

// Trust Railway's proxy
// app.set('trust proxy', 1);

// configure session with PrismaSessionStore
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 1000 * 60 * 2, // Clean expired sessions every 2 minutes
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

// configure and initialize passport
const passport = configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// set currentUser middleware (after Passport, before routes)
app.use(setCurrentUser);

// after currentUser has been set for it's used in this middleware
app.use(setCurrentFolder);

// routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/folders', folderRoutes);
app.use('/search', searchRoutes);

// handle other routes with not found
app.use((_req, _res, _next) => {
  throw new CustomNotFoundError('Page Not Found');
});

// global error handling
app.use(errorsHandler);

// Run server
const port = process.env.PORT || '8000';
app.listen(port, () => {
  console.log('Server is running on '.concat(port));
});
