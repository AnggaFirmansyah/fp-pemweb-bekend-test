import { StatusCodes } from 'http-status-codes';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

import { ErrorResponse, type IJwtPayload, JwtConfig } from '../common';

export const JwtUtils = {
  signToken: (payload: IJwtPayload) => {
    const accessToken = jwt.sign(payload, JwtConfig.JWT_ACCESS_SECRET, {
      expiresIn: JwtConfig.JWT_ACCESS_EXPIRES_IN,
    });

    return {
      access_token: accessToken,
    };
  },

  verifyToken: (token: string) => {
    try {
      return jwt.verify(token, JwtConfig.JWT_ACCESS_SECRET) as IJwtPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new ErrorResponse(StatusCodes.UNAUTHORIZED, error.message);

      return;
    }
  },
};
