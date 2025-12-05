import { StatusCodes } from 'http-status-codes';
import { type ZodType } from 'zod';

import { ErrorResponse } from '@/common';

export abstract class AdditionalValidation {
  static validate = <T>(schema: ZodType<T>, data: unknown) => {
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error;

      throw new ErrorResponse(StatusCodes.UNPROCESSABLE_ENTITY, errors.message);
    }

    return result.data;
  };

  static isPasswordValid(password: string, confirm_password?: string) {
    if (
      !isRegexValid(
        password,
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/,
      )
    )
      throw new ErrorResponse(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Password must be 8-64 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol',
      );

    if (confirm_password && password !== confirm_password)
      throw new ErrorResponse(
        StatusCodes.BAD_REQUEST,
        'Password and Confirm password did not match',
      );

    return true;
  }
}

function isRegexValid(input: string, pattern: RegExp): boolean {
  return pattern.test(input);
}
