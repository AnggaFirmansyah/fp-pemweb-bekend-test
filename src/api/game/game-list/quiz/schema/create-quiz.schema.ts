import z from 'zod';

import {
  fileArraySchema,
  fileSchema,
  StringToBooleanSchema,
  StringToObjectSchema,
} from '@/common';

export const QuizAnswerSchema = z.object({
  answer_text: z.string().max(512).trim(),
  is_correct: z.boolean(),
});

export const QuizQuestionSchema = z.object({
  question_text: z.string().max(2000).trim(),
  question_image_array_index: z.coerce.number().min(0).max(20).optional(), // multipart form tidak dapat menerima tipe file dalam object, field ini digunakan untuk memetakan file pada field files_to_upload
  answers: z.array(QuizAnswerSchema).min(1).max(10),
});

/*
karena format dari tiap item pada multipart form item selalu berupa string, maka kita harus menggunakan coerce, transform, atau preprocess untuk mengubah tipenya
*/
export const CreateQuizSchema = z.object({
  name: z.string().max(128).trim(),
  description: z.string().max(256).trim().optional(),
  thumbnail_image: fileSchema({}),
  is_publish_immediately: StringToBooleanSchema.default(false),
  is_question_randomized: StringToBooleanSchema.default(false),
  is_answer_randomized: StringToBooleanSchema.default(false),
  score_per_question: z.coerce.number().min(1).max(1000),
  files_to_upload: fileArraySchema({
    max_size: 2 * 1024 * 1024,
    min_amount: 1,
    max_amount: 20,
  }).optional(),
  questions: StringToObjectSchema(z.array(QuizQuestionSchema).min(1).max(20)),
});

export type ICreateQuiz = z.infer<typeof CreateQuizSchema>;
