import z from 'zod';

import {
  fileArraySchema,
  fileSchema,
  StringToBooleanSchema,
  StringToObjectSchema,
} from '@/common';

import { QuizAnswerSchema } from './create-quiz.schema';

export const UpdateQuizQuestionSchema = z.object({
  question_text: z.string().max(2000).trim(),
  question_image_array_index: z
    .union([z.coerce.number().min(0).max(20), z.string().max(512)])
    .optional(),
  answers: z.array(QuizAnswerSchema).min(1).max(10),
});

export const UpdateQuizSchema = z.object({
  name: z.string().max(128).trim().optional(),
  description: z.string().max(256).trim().optional(),
  thumbnail_image: fileSchema({}).optional(),
  is_publish: StringToBooleanSchema.optional(),
  is_question_randomized: StringToBooleanSchema.optional(),
  is_answer_randomized: StringToBooleanSchema.optional(),
  score_per_question: z.coerce.number().min(1).max(1000).optional(),
  files_to_upload: fileArraySchema({
    max_size: 2 * 1024 * 1024,
    min_amount: 1,
    max_amount: 20,
  }).optional(),
  questions: StringToObjectSchema(
    z.array(UpdateQuizQuestionSchema).min(1).max(20),
  ).optional(),
});

export type IUpdateQuiz = z.infer<typeof UpdateQuizSchema>;
