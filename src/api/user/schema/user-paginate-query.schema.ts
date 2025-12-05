import { ROLE } from '@prisma/client';
import z from 'zod';

import { OrderBySchema, PaginationSchema } from '@/common';

export const UserPaginationQuerySchema = z.object({
  page: PaginationSchema.pageSchema,
  perPage: PaginationSchema.perPageSchema,
  role: z.optional(z.enum(ROLE)),
  search: z.optional(z.string().max(256)),
  orderByName: OrderBySchema,
  orderById: OrderBySchema,
  orderByCreatedAt: OrderBySchema,
});

export type IUserPaginationQuery = z.infer<typeof UserPaginationQuerySchema>;
