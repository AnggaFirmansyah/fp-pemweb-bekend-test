import z from 'zod';

export const PaginationSchema = {
  pageSchema: z.coerce.number().min(1).max(99).default(1),
  perPageSchema: z.coerce.number().min(1).max(999).default(20),
};
