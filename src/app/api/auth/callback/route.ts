import { NextRequest, NextResponse } from "next/server";

import { clearOAuthState, getOAuthState, applySessionCookie } from "@/lib/auth/session";
import { exchangeCodeForTokens } from "@/lib/auth/spotify-oauth";
import { env } from "@/lib/config/env";
import { formatConfigError } from "@/lib/config/errors";

const oauthStateTtlMs = 10 * 60 * 1000;

function redirectToLanding(error: string) {
  const url = new URL("/", env.APP_BASE_URL);
  url.searchParams.set("authError", error);

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const spotifyError = searchParams.get("error");

  if (spotifyError) {
    await clearOAuthState();
    return redirectToLanding(spotifyError);
  }

  if (!code || !returnedState) {
    await clearOAuthState();
    return redirectToLanding("missing_oauth_params");
  }

  const storedState = await getOAuthState();

  if (!storedState) {
    return redirectToLanding("missing_oauth_state");
  }

  const isExpired = Date.now() - storedState.createdAt > oauthStateTtlMs;
  const isStateMismatch = storedState.state !== returnedState;

  if (isExpired || isStateMismatch) {
    await clearOAuthState();
    return redirectToLanding(isExpired ? "expired_oauth_state" : "invalid_oauth_state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code, storedState.codeVerifier);

    await clearOAuthState();

    const response = NextResponse.redirect(new URL("/dashboard", env.APP_BASE_URL));

    await applySessionCookie(response, {
      mode: "spotify",
      ...tokens,
    });

    return response;
  } catch (error) {
    console.error("Spotify callback failed:", error);
    await clearOAuthState();
    return redirectToLanding(formatConfigError(error));
  }
}
