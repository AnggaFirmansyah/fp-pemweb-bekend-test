import z from 'zod';

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64),
});

export type ILogin = z.infer<typeof LoginSchema>;
