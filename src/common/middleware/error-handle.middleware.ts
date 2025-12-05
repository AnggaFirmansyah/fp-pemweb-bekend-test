/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { type NextFunction, type Request, type Response } from 'express';

import { ErrorResponse } from '../response';

interface ValidationError {
  path: string[];
  message: string;
}

export const ErrorHandler = (
  error: Error | ErrorResponse,
  _: Request,
  response: Response,
  next: NextFunction,
) => {
  const errorStatus = error instanceof ErrorResponse ? error.code : 500;
  const errorMessage =
    errorStatus === 422
      ? (JSON.parse(error.message) as ValidationError[])
          .map(error_ => `${error_.message} in field ${error_.path.join(', ')}`)
          .join('. ')
      : error.message;

  response.status(errorStatus).json({
    status: false,
    code: errorStatus,
    message:
      errorStatus - 500 >= 0 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : errorMessage,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });

  next();
};
