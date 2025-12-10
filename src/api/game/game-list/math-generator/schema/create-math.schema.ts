import z from 'zod';
import { fileSchema, StringToBooleanSchema } from '@/common';

export const CreateMathGeneratorSchema = z.object({
  name: z.string().max(128).trim(),
  description: z.string().max(256).trim().optional(),
  thumbnail_image: fileSchema({}).optional(),
  is_publish_immediately: StringToBooleanSchema.default(false),
  
  // Settings untuk Logic Generator
  operation: z.enum(['addition', 'subtraction', 'multiplication', 'division']),
  min_number: z.coerce.number().min(0),
  max_number: z.coerce.number().min(1),
  question_count: z.coerce.number().min(1).max(20),
  
  score_per_question: z.coerce.number().min(1).max(1000).default(10),
}).refine((data) => data.max_number > data.min_number, {
  message: "Maximum number must be greater than minimum number",
  path: ["max_number"],
});

export type ICreateMathGenerator = z.infer<typeof CreateMathGeneratorSchema>;