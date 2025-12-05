import z from 'zod';

export const StringToBooleanSchema = z
  .string()
  .min(1)
  .max(5)
  .transform(item => item.toLowerCase() === 'true');

export const StringToObjectSchema = <U extends z.core.SomeType>(
  next_schema: U,
) =>
  z.preprocess(item => {
    if (typeof item !== 'string') return;

    try {
      return JSON.parse(item) as z.infer<typeof next_schema>;
    } catch {
      return;
    }
  }, next_schema);
