import z from 'zod';
import { type MimeTypes } from 'zod/v4/core/util.cjs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES: MimeTypes[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MIN_ARRAY_AMOUNT = 1;
const MAX_ARRAY_AMOUNT = 10;

export const fileSchema = ({
  max_size = MAX_FILE_SIZE,
  file_types = ACCEPTED_IMAGE_TYPES,
}: {
  max_size?: number;
  file_types?: MimeTypes[];
}) => {
  const schema = z.file().max(max_size).mime(file_types);

  return schema;
};

export const fileArraySchema = ({
  max_size,
  file_types,
  min_amount = MIN_ARRAY_AMOUNT,
  max_amount = MAX_ARRAY_AMOUNT,
}: {
  max_size?: number;
  file_types?: string[];
  min_amount?: number;
  max_amount?: number;
}) => {
  const schema = z
    .array(fileSchema({ max_size, file_types }))
    .min(min_amount)
    .max(max_amount);

  return schema;
};
