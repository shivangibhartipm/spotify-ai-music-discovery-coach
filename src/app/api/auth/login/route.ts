import { NextResponse } from "next/server";

import { createOAuthStateCookie } from "@/lib/auth/session";
import { createSpotifyAuthorizeUrl } from "@/lib/auth/spotify-oauth";
import { env } from "@/lib/config/env";
import { formatConfigError } from "@/lib/config/errors";

export async function GET() {
  try {
    const { authorizeUrl, state, codeVerifier } = await createSpotifyAuthorizeUrl();
    const response = NextResponse.redirect(authorizeUrl);
    const oauthCookie = await createOAuthStateCookie({
      state,
      codeVerifier,
      createdAt: Date.now(),
    });

    response.cookies.set(oauthCookie.name, oauthCookie.value, oauthCookie.options);

    return response;
  } catch (error) {
    const url = new URL("/", env.APP_BASE_URL);
    url.searchParams.set("authError", formatConfigError(error));

    return NextResponse.redirect(url);
  }
}
