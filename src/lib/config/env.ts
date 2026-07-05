import "server-only";

import { z } from "zod";

const appEnvSchema = z.object({
  APP_BASE_URL: z.string().url(),
});

const spotifyEnvSchema = z.object({
  SPOTIFY_CLIENT_ID: z.string().trim().min(1, "SPOTIFY_CLIENT_ID is required"),
  SPOTIFY_CLIENT_SECRET: z.string().trim().min(1, "SPOTIFY_CLIENT_SECRET is required"),
  SPOTIFY_REDIRECT_URI: z
    .string()
    .trim()
    .url("SPOTIFY_REDIRECT_URI must be a valid URL"),
});

const sessionEnvSchema = z.object({
  SESSION_SECRET: z
    .string()
    .trim()
    .min(32, "SESSION_SECRET must be at least 32 characters for cookie encryption"),
});

const groqEnvSchema = z.object({
  GROQ_API_KEY: z.string().trim().min(1, "GROQ_API_KEY is required"),
  GROQ_MODEL: z.string().trim().min(1, "GROQ_MODEL is required"),
});

const demoAiEnvSchema = z.object({
  DEMO_USE_LIVE_AI: z
    .string()
    .trim()
    .optional()
    .transform((value) => value === "true"),
});

export const env = appEnvSchema.parse({
  APP_BASE_URL: process.env.APP_BASE_URL?.trim(),
});

export function getSpotifyEnv() {
  return spotifyEnvSchema.parse({
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
  });
}

export function getSessionEnv() {
  return sessionEnvSchema.parse({
    SESSION_SECRET: process.env.SESSION_SECRET,
  });
}

export function getGroqEnv() {
  return groqEnvSchema.parse({
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
  });
}

export function getDemoAiEnv() {
  return demoAiEnvSchema.parse({
    DEMO_USE_LIVE_AI: process.env.DEMO_USE_LIVE_AI,
  });
}
