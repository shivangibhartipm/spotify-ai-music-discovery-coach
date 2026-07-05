import "server-only";

import { z } from "zod";

import { getSpotifyEnv } from "@/lib/config/env";
import { serverFetch } from "@/lib/http/server-fetch";

const spotifyAccountsBaseUrl = "https://accounts.spotify.com";

export const spotifyScopes = [
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
] as const;

const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number(),
  token_type: z.string(),
});

const tokenErrorSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
});

function generateCodeVerifier(length = 64) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));

  return values.reduce((acc, value) => acc + possible[value % possible.length], "");
}

function randomBase64Url(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function createCodeChallenge(codeVerifier: string) {
  const encodedVerifier = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", encodedVerifier);
  const bytes = new Uint8Array(digest);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function parseSpotifyTokenResponse(response: Response) {
  const payload = await response.json();
  const errorPayload = tokenErrorSchema.safeParse(payload);

  if (!response.ok) {
    const spotifyError = errorPayload.success
      ? [errorPayload.data.error, errorPayload.data.error_description].filter(Boolean).join(": ")
      : `HTTP ${response.status}`;

    throw new Error(`Spotify token exchange failed: ${spotifyError || "unknown_error"}`);
  }

  return tokenResponseSchema.parse(payload);
}

export async function createSpotifyAuthorizeUrl() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = getSpotifyEnv();
  const state = randomBase64Url();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const authorizeUrl = new URL("/authorize", spotifyAccountsBaseUrl);

  authorizeUrl.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", SPOTIFY_REDIRECT_URI);
  authorizeUrl.searchParams.set("scope", spotifyScopes.join(" "));
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("show_dialog", "true");

  return {
    authorizeUrl: authorizeUrl.toString(),
    state,
    codeVerifier,
  };
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = getSpotifyEnv();

  const response = await serverFetch(new URL("/api/token", spotifyAccountsBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
      code_verifier: codeVerifier,
    }),
  });

  const tokenResponse = await parseSpotifyTokenResponse(response);

  if (!tokenResponse.refresh_token) {
    throw new Error(
      "Spotify did not return a refresh token. Remove AI Discovery Coach from your Spotify account apps list and sign in again.",
    );
  }

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
  };
}

export async function refreshSpotifyAccessToken(refreshToken: string) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = getSpotifyEnv();

  const response = await serverFetch(new URL("/api/token", spotifyAccountsBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    }),
  });

  const tokenResponse = await parseSpotifyTokenResponse(response);

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token ?? refreshToken,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
  };
}
