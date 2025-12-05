import z from 'zod';

export const CheckAnswerSchema = z.object({
  answers: z
    .array(
      z.object({
        question_index: z.number().min(0),
        selected_answer_index: z.number().min(0),
      }),
    )
    .min(1),
});

export type ICheckAnswer = z.infer<typeof CheckAnswerSchema>;
