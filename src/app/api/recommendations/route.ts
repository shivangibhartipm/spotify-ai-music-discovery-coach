import { NextResponse } from "next/server";

import { getMusicRecommendations } from "@/domain/recommendations";
import { getProfileProvider } from "@/integration/profile-provider";
import { getValidSession, setSession } from "@/lib/auth/session";
import { formatConfigError } from "@/lib/config/errors";
import { checkRateLimit } from "@/lib/rate-limit";

function parseExcludedIds(request: Request) {
  const url = new URL(request.url);
  const queryExcludedIds = url.searchParams.getAll("exclude");

  return queryExcludedIds.flatMap((value) =>
    value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

function mergeShownIds(existingIds: string[] = [], newIds: string[] = []) {
  return [...new Set([...existingIds, ...newIds])].slice(-50);
}

export async function GET(request: Request) {
  const session = await getValidSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (session.mode === "demo") {
      const rateLimit = checkRateLimit({
        key: "demo:recommendations",
        limit: 12,
        windowMs: 10 * 60 * 1000,
      });

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error:
              "Demo recommendations are temporarily rate limited. Please try again in a few minutes or connect Spotify.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateLimit.retryAfterSeconds),
            },
          },
        );
      }
    }

    const provider = getProfileProvider(session);
    const profile = await provider.getProfile(session);
    const excludedIds = [
      ...(session.shownRecommendationIds ?? []),
      ...parseExcludedIds(request),
    ];
    const recommendations = await getMusicRecommendations({
      profile,
      session,
      excludedIds,
    });
    const shownRecommendationIds = mergeShownIds(
      session.shownRecommendationIds,
      recommendations.map((recommendation) => recommendation.id),
    );

    await setSession({
      ...session,
      shownRecommendationIds,
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    return NextResponse.json(
      {
        error: formatConfigError(error),
      },
      {
        status: 500,
      },
    );
  }
}
