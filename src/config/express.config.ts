import path from 'path';
import { fileURLToPath } from 'url';
import express, { Express } from 'express';
import expressEjsLayouts from 'express-ejs-layouts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function configureViewEngine(app: Express) {
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  app.use(expressEjsLayouts);
  app.set('layout', 'layout');
  app.set('view options', {
    rmWhitespace: true,
    cache: true,
  });
  app.set('view cache', true);

  // app.set('view options', {
  //   rmWhitespace: true,
  //   cache: process.env.NODE_ENV === 'production',
  // });
  // if (process.env.NODE_ENV === 'production') {
  //   app.set('view cache', true);
  // }
}

export function configureStaticFiles(app: Express) {
  app.use(express.static(path.join(__dirname, '../public')));

  // if (process.env.NODE_ENV === 'development') {
  //   app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  // }
}
