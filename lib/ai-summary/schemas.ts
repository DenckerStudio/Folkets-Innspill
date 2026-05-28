import { z } from 'zod';

export const summaryCardSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(4).max(80),
  hint: z.string().min(4).max(120).optional(),
  body: z.string().min(24).max(450),
});

export const sakCardsGenerationSchema = z.object({
  cards: z.array(summaryCardSchema).min(3).max(5),
});

export const singleCardSchema = z.object({
  card: summaryCardSchema,
});

export const cardValidationSchema = z.object({
  approved: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  missingAspects: z.array(z.string()).optional(),
  suggestedRevision: z.string().optional(),
});

export type SummaryCardGenerated = z.infer<typeof summaryCardSchema>;
export type SakCardsGeneration = z.infer<typeof sakCardsGenerationSchema>;
export type CardValidation = z.infer<typeof cardValidationSchema>;
