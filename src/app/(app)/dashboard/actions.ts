"use server";

import {
  getMusicRecommendations,
  getSurpriseRecommendation,
  type MusicRecommendation,
  type SurpriseRecommendation,
} from "@/domain/recommendations";
import { getProfileProvider } from "@/integration/profile-provider";
import { getValidSession, setSession } from "@/lib/auth/session";
import { formatConfigError } from "@/lib/config/errors";
import { checkRateLimit } from "@/lib/rate-limit";

function mergeShownIds(existingIds: string[] = [], newIds: string[] = []) {
  return [...new Set([...existingIds, ...newIds])].slice(-50);
}

function assertDemoRateLimit(key: "demo:recommendations" | "demo:surprise") {
  const rateLimit = checkRateLimit({
    key,
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    throw new Error(
      key === "demo:recommendations"
        ? "Demo recommendations are temporarily rate limited. Please try again in a few minutes or connect Spotify."
        : "Demo surprises are temporarily rate limited. Please try again in a few minutes or connect Spotify.",
    );
  }
}

export async function refreshRecommendationsAction(
  excludedIds: string[],
): Promise<{ recommendations: MusicRecommendation[] }> {
  const session = await getValidSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    if (session.mode === "demo") {
      assertDemoRateLimit("demo:recommendations");
    }

    const provider = getProfileProvider(session);
    const profile = await provider.getProfile(session);
    const recommendations = await getMusicRecommendations({
      profile,
      session,
      excludedIds: [...(session.shownRecommendationIds ?? []), ...excludedIds],
    });

    await setSession({
      ...session,
      shownRecommendationIds: mergeShownIds(
        session.shownRecommendationIds,
        recommendations.map((recommendation) => recommendation.id),
      ),
    });

    return { recommendations };
  } catch (error) {
    throw new Error(formatConfigError(error));
  }
}

export async function getSurpriseRecommendationAction(): Promise<{
  recommendation: SurpriseRecommendation;
}> {
  const session = await getValidSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    if (session.mode === "demo") {
      assertDemoRateLimit("demo:surprise");
    }

    const provider = getProfileProvider(session);
    const profile = await provider.getProfile(session);
    const recommendation = await getSurpriseRecommendation({
      profile,
      session,
    });

    return { recommendation };
  } catch (error) {
    throw new Error(formatConfigError(error));
  }
}
