import z from 'zod';

import { OrderBySchema, PaginationSchema } from '@/common';

export const GamePaginateQuerySchema = z.object({
  page: PaginationSchema.pageSchema,
  perPage: PaginationSchema.perPageSchema,
  search: z.string().max(256).optional(),
  gameTypeSlug: z.string().max(32).toLowerCase().optional(),
  orderByName: OrderBySchema,
  orderByCreatedAt: OrderBySchema,
  orderByLikeAmount: OrderBySchema,
  orderByPlayAmount: OrderBySchema,
});

export type IGamePaginateQuery = z.infer<typeof GamePaginateQuerySchema>;
