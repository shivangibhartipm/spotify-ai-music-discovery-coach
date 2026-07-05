import "server-only";

import type { NextRequest, NextResponse } from "next/server";
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

async function readSessionCookieValue(request?: NextRequest) {
  const requestCookieValue = request?.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (requestCookieValue) {
    return requestCookieValue;
  }

  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

async function decryptSession(cookieValue: string | undefined) {
  const secret = getSessionEnv().SESSION_SECRET;

  return decryptCookieValue<AppSession>(cookieValue, secret);
}

export async function createSessionCookie(session: AppSession) {
  const secret = getSessionEnv().SESSION_SECRET;
  const encryptedSession = await encryptCookieValue(session, secret);

  return {
    name: SESSION_COOKIE_NAME,
    value: encryptedSession,
    options: {
      ...cookieDefaults,
      maxAge: sessionMaxAgeSeconds,
    },
  };
}

export async function applySessionCookie(response: NextResponse, session: AppSession) {
  const sessionCookie = await createSessionCookie(session);

  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

  return response;
}

export async function getSession(request?: NextRequest) {
  return decryptSession(await readSessionCookieValue(request));
}

async function resolveValidSession(session: AppSession | null) {
  if (!session || session.mode === "demo") {
    return session;
  }

  const refreshBufferMs = 60 * 1000;
  const shouldRefresh = session.expiresAt <= Date.now() + refreshBufferMs;

  if (!shouldRefresh) {
    return session;
  }

  try {
    const refreshedTokens = await refreshSpotifyAccessToken(session.refreshToken);

    return {
      mode: "spotify" as const,
      ...refreshedTokens,
      shownRecommendationIds: session.shownRecommendationIds,
    };
  } catch (error) {
    if (session.expiresAt > Date.now()) {
      return session;
    }

    throw error;
  }
}

export async function getValidSession(request?: NextRequest) {
  const session = await getSession(request);
  const validSession = await resolveValidSession(session);
  const tokenWasRefreshed =
    validSession?.mode === "spotify" &&
    session?.mode === "spotify" &&
    validSession.accessToken !== session.accessToken;

  if (tokenWasRefreshed && !request) {
    await setSession(validSession);
  }

  return validSession;
}

export async function setSession(session: AppSession) {
  const cookieStore = await cookies();
  const sessionCookie = await createSessionCookie(session);

  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
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
