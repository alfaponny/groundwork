import { z } from 'zod';

export const specSchema = z.object({
  title: z.string(),
  problem: z.string(),
  targetUsers: z.string(),
  mvpFeatures: z.array(z.string()),
  hourEstimate: z.number().int(),
  complexityTier: z.enum(['simple', 'medium', 'advanced']),
});
export type Spec = z.infer<typeof specSchema>;

export const answersSchema = z.object({
  productIdea: z.string(),
  targetUsers: z.string(),
  keyProblems: z.string(),
  timeline: z.string(),
  complexityLevel: z.enum(['simple', 'medium', 'advanced']),
});
export type Answers = z.infer<typeof answersSchema>;

export const competitorSchema = z.object({
  name: z.string(),
  url: z.string(),
  oneLiner: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});
export type Competitor = z.infer<typeof competitorSchema>;

export const gapsSchema = z.object({
  opportunities: z.array(z.string()),
  specRefinements: z.array(z.string()),
});

export type Gaps = z.infer<typeof gapsSchema>;

export const specCoreSchema = specSchema.omit({
  hourEstimate: true,
  complexityTier: true,
});
export type SpecCore = z.infer<typeof specCoreSchema>;
