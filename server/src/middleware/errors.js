import mongoose from 'mongoose';
import { HttpError } from '../utils/http.js';

export const notFound = (req) => {
  throw new HttpError(404, `No route for ${req.method} ${req.originalUrl}`);
};

// Every error becomes `{ error: "message" }` with a sensible status; internals are never leaked.
// eslint-disable-next-line no-unused-vars -- Express recognises error handlers by their 4 arguments.
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(err.errors)[0]?.message || 'Invalid data';
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'Invalid id';
  } else if (err?.code === 11000) {
    status = 409;
    message = 'That record already exists';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  } else if (!(err instanceof HttpError) && status >= 500) {
    console.error(err);
    message = 'Something went wrong on our side. Please try again.';
  }

  res.status(status).json({ error: message });
};
