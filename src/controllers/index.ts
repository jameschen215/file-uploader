import { RequestHandler } from 'express';

export const getHomepage: RequestHandler = (req, res, next) => {
	res.json({ message: 'Welcome to homepage!' });
};
