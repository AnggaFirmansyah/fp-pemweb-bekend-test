import z from 'zod';

import { fileSchema } from '@/common';

export const UpdateUserSchema = z
  .object({
    username: z.string().min(1).max(100),
    profile_picture: fileSchema({}),
  })
  .partial();

export type IUpdateUser = z.infer<typeof UpdateUserSchema>;
