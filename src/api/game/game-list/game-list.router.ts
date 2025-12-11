import { Router } from 'express';

import { MathGeneratorController } from './math-generator/math-generator.controller';
import { QuizController } from './quiz/quiz.controller';

const gameListRouter = Router();

gameListRouter.use('/quiz', QuizController);
gameListRouter.use('/math-generator', MathGeneratorController);

export { gameListRouter };
