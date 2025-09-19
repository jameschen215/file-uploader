import { Request, Response, NextFunction } from 'express';
import {
	CustomBadRequestError,
	CustomForbiddenError,
	CustomInternalError,
	CustomNotFoundError,
	CustomUnauthorizedError,
} from './index.js';

export function errorsHandler(
	error: any,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	console.log(error);

	if (
		error instanceof CustomBadRequestError ||
		error instanceof CustomForbiddenError ||
		error instanceof CustomInternalError ||
		error instanceof CustomNotFoundError ||
		error instanceof CustomUnauthorizedError
	) {
		return res.status(error.statusCode).render('error-page', {
			title: error.name,
			message: error.message,
			statusCode: error.statusCode,
		});
	}

	// fallback for unexpected errors
	console.error('Unexpected error:', error);
	res.status(500).render('error-page', {
		title: 'InternalServerError',
		message: 'Something went wrong',
		statusCode: 500,
	});
}
