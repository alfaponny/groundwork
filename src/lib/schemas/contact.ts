import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'errors.name.tooShort')
    .max(100, 'errors.name.tooLong'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('errors.email.invalid')
    .min(3, 'errors.email.tooShort')
    .max(100, 'errors.email.tooLong'),
  company: z
    .string()
    .trim()
    .min(2, 'errors.company.tooShort')
    .max(100, 'errors.company.tooLong'),
  locale: z.enum(['sv', 'en']),
}); //strict()?

export type Contact = z.infer<typeof contactSchema>;
