import "server-only";

import { analyzeProfile } from "@/domain/analysis";
import type { ListeningProfile } from "@/domain/profile/listening-profile";
import { getDiscoveryScore } from "@/domain/scoring";
import demoRecommendations from "@/fixtures/demo-recommendations.json";
import demoSurprise from "@/fixtures/demo-surprise.json";
import { GroqClient } from "@/integration/groq/client";
import {
  enrichRecommendationWithSpotify,
  enrichSurpriseRecommendationWithSpotify,
} from "@/integration/spotify/search";
import type { AppSession } from "@/lib/auth/session-core";
import { getDemoAiEnv } from "@/lib/config/env";
import {
  musicRecommendationPoolSchema,
  musicRecommendationsSchema,
  surpriseRecommendationSchema,
  type MusicRecommendation,
  type SurpriseRecommendation,
} from "@/lib/validation/recommendations";

import { buildRecommendationPrompt, buildSurprisePrompt } from "./prompt";

type RecommendationOptions = {
  profile: ListeningProfile;
  session: AppSession;
  excludedIds?: string[];
};

function getCachedDemoRecommendations(excludedIds: string[] = []) {
  const pool = musicRecommendationPoolSchema.parse(demoRecommendations);
  const excluded = new Set(excludedIds);
  const fresh = pool.filter((recommendation) => !excluded.has(recommendation.id));
  const selected = fresh.length >= 5 ? fresh.slice(0, 5) : pool.slice(0, 5);

  return musicRecommendationsSchema.parse(selected);
}

export async function getMusicRecommendations({
  profile,
  session,
  excludedIds = [],
}: RecommendationOptions): Promise<MusicRecommendation[]> {
  const { DEMO_USE_LIVE_AI } = getDemoAiEnv();

  if (session.mode === "demo" && !DEMO_USE_LIVE_AI) {
    return getCachedDemoRecommendations(excludedIds);
  }

  const analysis = analyzeProfile(profile);
  const discoveryScore = getDiscoveryScore(analysis);
  const excluded = new Set(excludedIds);
  const excludedRecommendationNames = profile.topTracks
    .filter((track) => excluded.has(track.id))
    .map((track) => `${track.title} by ${track.artistNames.join(", ")}`);
  const prompt = buildRecommendationPrompt({
    profile,
    analysis,
    discoveryScore,
    excludedRecommendationNames,
  });
  const groqClient = new GroqClient();
  const llmRecommendations = await groqClient.generateRecommendations(prompt);
  const accessToken = session.mode === "spotify" ? session.accessToken : undefined;
  const enrichedRecommendations = await Promise.all(
    llmRecommendations.map((recommendation) =>
      enrichRecommendationWithSpotify(recommendation, accessToken),
    ),
  );

  return musicRecommendationsSchema.parse(enrichedRecommendations);
}

export async function getSurpriseRecommendation({
  profile,
  session,
}: RecommendationOptions): Promise<SurpriseRecommendation> {
  const { DEMO_USE_LIVE_AI } = getDemoAiEnv();

  if (session.mode === "demo" && !DEMO_USE_LIVE_AI) {
    return surpriseRecommendationSchema.parse(demoSurprise);
  }

  const analysis = analyzeProfile(profile);
  const discoveryScore = getDiscoveryScore(analysis);
  const prompt = buildSurprisePrompt({
    profile,
    analysis,
    discoveryScore,
  });
  const groqClient = new GroqClient();
  const surprise = await groqClient.generateSurpriseRecommendation(prompt);
  const accessToken = session.mode === "spotify" ? session.accessToken : undefined;
  const enriched = await enrichSurpriseRecommendationWithSpotify(surprise, accessToken);

  return surpriseRecommendationSchema.parse(enriched);
}

export type { MusicRecommendation, SurpriseRecommendation };
