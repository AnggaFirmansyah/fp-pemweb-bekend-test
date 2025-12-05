import z from 'zod';

export const CheckMathAnswerSchema = z.object({
  answers: z
    .array(
      z.object({
        question_index: z.number().min(0),
        selected_answer: z.string(), // Kita pakai string agar fleksibel
      }),
    )
    .min(1),
});

export type ICheckMathAnswer = z.infer<typeof CheckMathAnswerSchema>;