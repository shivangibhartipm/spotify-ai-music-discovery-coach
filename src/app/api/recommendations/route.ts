import { NextRequest, NextResponse } from "next/server";

import { getMusicRecommendations } from "@/domain/recommendations";
import { getProfileProvider } from "@/integration/profile-provider";
import { applySessionCookie, getValidSession } from "@/lib/auth/session";
import { formatConfigError } from "@/lib/config/errors";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function parseExcludedIds(request: NextRequest) {
  const queryExcludedIds = request.nextUrl.searchParams.getAll("exclude");

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

export async function GET(request: NextRequest) {
  const session = await getValidSession(request);

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
    const updatedSession = {
      ...session,
      shownRecommendationIds: mergeShownIds(
        session.shownRecommendationIds,
        recommendations.map((recommendation) => recommendation.id),
      ),
    };
    const response = NextResponse.json({ recommendations });

    await applySessionCookie(response, updatedSession);

    return response;
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
