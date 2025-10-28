export class CustomNotFoundError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);

    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class CustomBadRequestError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);

    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

export class CustomForbiddenError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);

    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export class CustomInternalError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);

    this.name = 'InternalError';
    this.statusCode = 500;
  }
}
export class CustomUnauthorizedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);

    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}
