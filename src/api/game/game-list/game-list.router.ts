/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-default-export */
import { Router } from 'express';

import { QuizController } from './quiz/quiz.controller';
import { MathGeneratorController } from './math-generator/math-generator.controller';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/math-generator', MathGeneratorController); // Endpoint ini yang akan dipanggil frontend

export default GameListRouter;