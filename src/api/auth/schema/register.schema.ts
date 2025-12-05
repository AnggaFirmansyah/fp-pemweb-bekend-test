import z from 'zod';

import { fileSchema } from '@/common';

export const RegisterSchema = z.object({
  username: z.string().min(1).max(100).trim(),
  email: z.email().trim(),
  password: z.string().min(8).max(64),
  profile_picture: z.optional(fileSchema({})),
});

export type IRegister = z.infer<typeof RegisterSchema>;
