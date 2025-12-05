import z from 'zod';

export const UpdateLikeCountSchema = z.object({
  game_id: z.uuid(),
  is_like: z.boolean(),
});

export type IUpdateLikeCount = z.infer<typeof UpdateLikeCountSchema>;
