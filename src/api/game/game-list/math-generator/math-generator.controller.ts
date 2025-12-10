import { type NextFunction, type Request, type Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import {
  type AuthedRequest,
  SuccessResponse,
  validateAuth,
  validateBody,
} from '@/common';

import { MathGeneratorService } from './math-generator.service';
import {
  CheckMathAnswerSchema,
  CreateMathGeneratorSchema,
  type ICheckMathAnswer,
  type ICreateMathGenerator,
} from './schema';

export const MathGeneratorController = Router()
  .post(
    '/',
    validateAuth({}),
    validateBody({
      schema: CreateMathGeneratorSchema,
      file_fields: [{ name: 'thumbnail_image', maxCount: 1 }],
    }),
    // PERBAIKAN: Ubah {} kedua menjadi any agar kompatibel dengan SuccessResponse
    async (
      request: AuthedRequest<{}, any, ICreateMathGenerator>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const result = await MathGeneratorService.createGame(
          request.body,
          request.user!.user_id,
        );
        const res = new SuccessResponse(
          StatusCodes.CREATED,
          'Math game created',
          result,
        );
        return response.status(res.statusCode).json(res.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .get(
    '/:game_id/play/public',
    async (
      request: Request<{ game_id: string }>, 
      response: Response, 
      next: NextFunction
    ) => {
      try {
        const result = await MathGeneratorService.getGamePlay(
          request.params.game_id,
          true,
        );
        const res = new SuccessResponse(
          StatusCodes.OK,
          'Game data fetched',
          result,
        );
        return response.status(res.statusCode).json(res.json());
      } catch (error) {
        return next(error);
      }
    }
  )
  .get(
    '/:game_id/play/private',
    validateAuth({}),
    async (
      request: AuthedRequest<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const result = await MathGeneratorService.getGamePlay(
          request.params.game_id,
          true, // Dianggap public view tapi via private route
          request.user!.user_id,
          request.user!.role,
        );
        const res = new SuccessResponse(
          StatusCodes.OK,
          'Game data fetched',
          result,
        );
        return response.status(res.statusCode).json(res.json());
      } catch (error) {
        return next(error);
      }
    }
  )
  .post(
    '/:game_id/check',
    validateBody({ schema: CheckMathAnswerSchema }),
    async (
      request: Request<{ game_id: string }, {}, ICheckMathAnswer>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const result = await MathGeneratorService.checkAnswer(
          request.params.game_id,
          request.body,
        );
        const res = new SuccessResponse(
          StatusCodes.OK,
          'Answers checked',
          result,
        );
        return response.status(res.statusCode).json(res.json());
      } catch (error) {
        return next(error);
      }
    },
  );