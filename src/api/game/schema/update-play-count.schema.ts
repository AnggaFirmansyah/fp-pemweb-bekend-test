import z from 'zod';

export const UpdatePlayCountSchema = z.object({
  game_id: z.uuid(),
});

export type IUpdatePlayCount = z.infer<typeof UpdatePlayCountSchema>;
