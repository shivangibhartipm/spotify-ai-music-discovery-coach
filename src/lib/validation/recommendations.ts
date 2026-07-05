import { z } from "zod";

export const llmRecommendationSchema = z.object({
  songTitle: z.string().min(1),
  artist: z.string().min(1),
  genre: z.string().min(1),
  explanation: z.string().min(20),
});

export const llmRecommendationResponseSchema = z.object({
  recommendations: z.array(llmRecommendationSchema).length(5),
});

export const musicRecommendationSchema = llmRecommendationSchema.extend({
  id: z.string().min(1),
  albumArtworkUrl: z.string().url(),
  spotifyUrl: z.string().url(),
});

export const musicRecommendationsSchema = z.array(musicRecommendationSchema).length(5);

export const musicRecommendationPoolSchema = z.array(musicRecommendationSchema).min(5);

export const llmSurpriseRecommendationSchema = z.object({
  songTitle: z.string().min(1),
  artist: z.string().min(1),
  genre: z.string().min(1),
  whySurprising: z.string().min(20),
  whyUserMayEnjoyIt: z.string().min(20),
  explorationLevel: z.enum(["Safe Discovery", "Moderate Stretch", "Bold Discovery"]),
});

export const llmSurpriseRecommendationResponseSchema = z.object({
  recommendation: llmSurpriseRecommendationSchema,
});

export const surpriseRecommendationSchema = llmSurpriseRecommendationSchema.extend({
  id: z.string().min(1),
  albumArtworkUrl: z.string().url(),
  spotifyUrl: z.string().url(),
});

export type LlmRecommendation = z.infer<typeof llmRecommendationSchema>;
export type MusicRecommendation = z.infer<typeof musicRecommendationSchema>;
export type LlmSurpriseRecommendation = z.infer<typeof llmSurpriseRecommendationSchema>;
export type SurpriseRecommendation = z.infer<typeof surpriseRecommendationSchema>;
