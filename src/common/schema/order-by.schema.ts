import { Prisma } from '@prisma/client';
import z from 'zod';

export const OrderBySchema = z.optional(z.enum(Prisma.SortOrder));
