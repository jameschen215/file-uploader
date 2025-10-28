import { RequestHandler } from 'express';

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  // asyncHandler takes your async function (fn) and returns a NEW function

  return (req, res, next) => {
    // This returned function is what Express actually calls

    // We call your original function (fn) and wrap it in Promise.resolve()
    // Promise.resolve() ensures we're working with a Promise
    Promise.resolve(fn(req, res, next)).catch(next);
    // If the Promise rejects (error thrown), pass it to next()
  };
};

// Key Takeaways

// asyncHandler automatically catches errors from async functions
// It passes errors to next(), which triggers Express error handler
// It eliminates repetitive try/catch blocks
// It makes your code cleaner and less error-prone
