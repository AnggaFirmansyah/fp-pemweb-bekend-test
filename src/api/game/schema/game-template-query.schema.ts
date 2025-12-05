import z from 'zod';

export const GameTemplateQuerySchema = z.object({
  search: z.string().max(256).optional(),
  lite: z
    .string()
    .transform(item => item.toLowerCase() === 'true')
    .default(false),
  withTimeLimit: z
    .string()
    .transform(item => item.toLowerCase() === 'true')
    .optional(),
  withLifeLimit: z
    .string()
    .transform(item => item.toLowerCase() === 'true')
    .optional(),
});

export type IGameTemplateQuery = z.infer<typeof GameTemplateQuerySchema>;
