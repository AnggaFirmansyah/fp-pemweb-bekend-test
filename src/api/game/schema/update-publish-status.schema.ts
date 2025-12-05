import z from 'zod';

export const UpdatePublishStatusSchema = z.object({
  game_id: z.uuid(),
  is_publish: z.boolean(),
});

export type IUpdatePublishStatus = z.infer<typeof UpdatePublishStatusSchema>;
