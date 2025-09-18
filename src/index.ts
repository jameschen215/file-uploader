import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

import { configurePassport, isAuthenticated } from './auth';
import authRoutes from './routes/auth';

const app = express();

app.use(express.json());

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
	})
);

// configure and initialize passport
const passport = configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
	res.json({ message: 'Hello world!' });
});

app.get('/protected', isAuthenticated, (req, res) => {
	res.json({ message: 'This is a protected route!' });
});

app.use('/auth', authRoutes);

// handle other routes with not found
// app.use((_req, _res, _next) => {
// 	throw new CustomNotFoundError('Page Not Found');
// });

// Error handling
// app.use(errorsHandler);

const port = process.env.PORT || '8000';
app.listen(port, () => {
	console.log('App is running on '.concat(port));
});
