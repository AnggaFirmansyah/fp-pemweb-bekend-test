import z from 'zod';

import { fileSchema, StringToBooleanSchema } from '@/common';

export const CreateMathGeneratorSchema = z.object({
  name: z.string().max(128).trim(),
  description: z.string().max(256).trim().optional(),
  thumbnail_image: fileSchema({}).optional(),
  is_publish_immediately: StringToBooleanSchema.default(false),
  
  // Konfigurasi Generator
  question_count: z.coerce.number().min(1).max(50).default(10),
  min_range: z.coerce.number().min(1).max(1000).default(1),
  max_range: z.coerce.number().min(5).max(10000).default(20),
  allow_addition: StringToBooleanSchema.default(true),
  allow_subtraction: StringToBooleanSchema.default(false),
  allow_multiplication: StringToBooleanSchema.default(false),
  allow_division: StringToBooleanSchema.default(false),
});

export type ICreateMathGenerator = z.infer<typeof CreateMathGeneratorSchema>;