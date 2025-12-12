import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express, { Express } from 'express';
import methodOverride from 'method-override';

export function configureMiddleware(app: Express) {
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(methodOverride('_method'));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        imgSrc: ["'self'", 'data:', 'https://djckxvnpmjpsxsmphbqa.supabase.co'],
      },
    }),
  );
}
