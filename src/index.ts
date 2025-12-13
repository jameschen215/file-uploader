import 'dotenv/config';
import express from 'express';

import {
  configureStaticFiles,
  configureViewEngine,
} from './config/express.config.js';
import { configurePassport } from './auth/index.js';
import { configureRoutes } from './config/routes.config.js';
import { configureSession } from './config/session.config.js';
import { configureMiddleware } from './config/middleware.config.js';

import { formatAvatar } from './middlewares/format-avatar.js';
import { setCurrentUser } from './middlewares/set-current-user.js';
import { getLucideIcons } from './middlewares/get-lucide-icons.js';
import { setCurrentPath } from './middlewares/set-current-path.js';

const app = express();

// Configure app
configureViewEngine(app);
configureMiddleware(app);
configureStaticFiles(app);

// Session & Auth
app.use(configureSession());
const passport = configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Custom middlewares
app.use(getLucideIcons);
app.use(formatAvatar);
app.use(setCurrentPath);
app.use(setCurrentUser);

// Routes & Error handling
configureRoutes(app);

// Start server
const port = process.env.PORT || '8000';
app.listen(port, () => {
  console.log('Server is running on '.concat(port));
});
