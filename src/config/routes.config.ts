import { Express } from 'express';
import routes from '../routes/index.routes.js';
import authRoutes from '../routes/auth.routes.js';
import { CustomNotFoundError } from '../errors/index.js';
import { errorsHandler } from '../middlewares/error-handler.js';

export function configureRoutes(app: Express) {
  // Auth routes
  app.use('/auth', authRoutes);

  // Main app routes
  app.use('/', routes);

  // 404 handler
  app.use((_req, _res, _next) => {
    throw new CustomNotFoundError('Page not found');
  });

  // Global error handler
  app.use(errorsHandler);
}
