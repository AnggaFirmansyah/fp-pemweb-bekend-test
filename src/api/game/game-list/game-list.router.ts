/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-default-export */
import { Router } from 'express';

import { MathGeneratorController } from './math-generator/math-generator.controller'; // Import Controller
import { QuizController } from './quiz/quiz.controller';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/math-generator', MathGeneratorController); // Daftarkan di sini

export default GameListRouter;