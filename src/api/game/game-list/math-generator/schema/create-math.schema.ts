import z from 'zod';
import { fileSchema, StringToBooleanSchema } from '@/common';

export const CreateMathGeneratorSchema = z.object({
  name: z.string().max(128).trim(),
  description: z.string().max(256).trim().optional(),
  thumbnail_image: fileSchema({}).optional(),
  is_publish_immediately: StringToBooleanSchema.default(false),
  
  // Update: Tambah 'random'
  operation: z.enum(['addition', 'subtraction', 'multiplication', 'division', 'random']),
  
  // Update: Ganti min/max dengan difficulty
  difficulty: z.enum(['easy', 'medium', 'hard']),
  
  // Update: Tambah theme
  theme: z.string().default('candy'),

  question_count: z.coerce.number().min(1).max(50).default(10),
  score_per_question: z.coerce.number().min(1).max(1000).default(10),
});

export type ICreateMathGenerator = z.infer<typeof CreateMathGeneratorSchema>;