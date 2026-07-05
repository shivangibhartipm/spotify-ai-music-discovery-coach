import { NextResponse } from "next/server";

import { getSurpriseRecommendation } from "@/domain/recommendations";
import { getProfileProvider } from "@/integration/profile-provider";
import { getValidSession } from "@/lib/auth/session";
import { formatConfigError } from "@/lib/config/errors";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getValidSession();

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

    return NextResponse.json({ recommendation });
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
