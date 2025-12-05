import { type NextFunction, type Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import {
  type AuthedRequest,
  SuccessResponse,
  validateAuth,
  validateBody,
} from '@/common';
import { AdditionalValidation } from '@/utils';

import { UserPaginationQuerySchema } from './schema';
import {
  type IUpdateUser,
  UpdateUserSchema,
} from './schema/update-user.schema';
import { UserService } from './user.service';

export const UserController = Router()
  .use(validateAuth({ allowed_roles: ['SUPER_ADMIN'] }))
  .get(
    '/',
    async (request: AuthedRequest, response: Response, next: NextFunction) => {
      try {
        const query = AdditionalValidation.validate(
          UserPaginationQuerySchema,
          request.query,
        );

        const paginationResult = await UserService.getAllUsers(query);
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get user list successfully',
          paginationResult.data,
          paginationResult.meta,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .get(
    '/:user_id',
    async (
      request: AuthedRequest<{ user_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const data = await UserService.getUserDetail(request.params.user_id);

        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get user detail successfully',
          data,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .patch(
    '/:user_id',
    validateBody({
      schema: UpdateUserSchema,
      file_fields: [{ name: 'profile_picture', maxCount: 1 }],
    }),
    async (
      request: AuthedRequest<{ user_id: string }, {}, IUpdateUser>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const data = await UserService.updateUser(
          request.params.user_id,
          request.body,
        );

        const result = new SuccessResponse(
          StatusCodes.OK,
          'User updated successfully',
          data,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .delete(
    '/:user_id',
    async (
      request: AuthedRequest<{ user_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        await UserService.deleteUser(request.params.user_id);

        const result = new SuccessResponse(
          StatusCodes.OK,
          'User deleted successfully',
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  );
