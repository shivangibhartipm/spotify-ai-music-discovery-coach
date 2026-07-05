import "server-only";

import { cookies } from "next/headers";

import { getSessionEnv } from "@/lib/config/env";

import {
  decryptCookieValue,
  encryptCookieValue,
  OAUTH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  type AppSession,
  type OAuthState,
} from "./session-core";
import { refreshSpotifyAccessToken } from "./spotify-oauth";

const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;
const oauthMaxAgeSeconds = 60 * 10;

const cookieDefaults = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function getSession() {
  const cookieStore = await cookies();
  const secret = getSessionEnv().SESSION_SECRET;
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return decryptCookieValue<AppSession>(cookieValue, secret);
}

export async function getValidSession() {
  const session = await getSession();

  if (!session || session.mode === "demo") {
    return session;
  }

  const refreshBufferMs = 60 * 1000;
  const shouldRefresh = session.expiresAt <= Date.now() + refreshBufferMs;

  if (!shouldRefresh) {
    return session;
  }

  const refreshedTokens = await refreshSpotifyAccessToken(session.refreshToken);
  const refreshedSession = {
    mode: "spotify" as const,
    ...refreshedTokens,
    shownRecommendationIds: session.shownRecommendationIds,
  };

  await setSession(refreshedSession);

  return refreshedSession;
}

export async function setSession(session: AppSession) {
  const cookieStore = await cookies();
  const secret = getSessionEnv().SESSION_SECRET;
  const encryptedSession = await encryptCookieValue(session, secret);

  cookieStore.set(SESSION_COOKIE_NAME, encryptedSession, {
    ...cookieDefaults,
    maxAge: sessionMaxAgeSeconds,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(OAUTH_COOKIE_NAME);
}

export async function createOAuthStateCookie(oauthState: OAuthState) {
  const secret = getSessionEnv().SESSION_SECRET;
  const encryptedState = await encryptCookieValue(oauthState, secret);

  return {
    name: OAUTH_COOKIE_NAME,
    value: encryptedState,
    options: {
      ...cookieDefaults,
      maxAge: oauthMaxAgeSeconds,
    },
  };
}

export async function setOAuthState(oauthState: OAuthState) {
  const cookieStore = await cookies();
  const oauthCookie = await createOAuthStateCookie(oauthState);

  cookieStore.set(oauthCookie.name, oauthCookie.value, oauthCookie.options);
}

export async function getOAuthState() {
  const cookieStore = await cookies();
  const secret = getSessionEnv().SESSION_SECRET;
  const cookieValue = cookieStore.get(OAUTH_COOKIE_NAME)?.value;

  return decryptCookieValue<OAuthState>(cookieValue, secret);
}

export async function clearOAuthState() {
  const cookieStore = await cookies();

  cookieStore.delete(OAUTH_COOKIE_NAME);
}

export type { AppSession };
