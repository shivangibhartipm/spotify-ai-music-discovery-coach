import { NextRequest, NextResponse } from "next/server";

import { getSurpriseRecommendation } from "@/domain/recommendations";
import { getProfileProvider } from "@/integration/profile-provider";
import { applySessionCookie, getValidSession } from "@/lib/auth/session";
import { formatConfigError } from "@/lib/config/errors";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function handleSurpriseRequest(request: NextRequest) {
  const session = await getValidSession(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (session.mode === "demo") {
      const rateLimit = checkRateLimit({
        key: "demo:surprise",
        limit: 12,
        windowMs: 10 * 60 * 1000,
      });

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error:
              "Demo surprises are temporarily rate limited. Please try again in a few minutes or connect Spotify.",
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
    const recommendation = await getSurpriseRecommendation({
      profile,
      session,
    });
    const response = NextResponse.json({ recommendation });

    await applySessionCookie(response, session);

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

export async function GET(request: NextRequest) {
  return handleSurpriseRequest(request);
}

export async function POST(request: NextRequest) {
  return handleSurpriseRequest(request);
}
