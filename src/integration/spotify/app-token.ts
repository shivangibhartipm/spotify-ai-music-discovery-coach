import "server-only";

import { z } from "zod";

import { getSpotifyEnv } from "@/lib/config/env";
import { serverFetch } from "@/lib/http/server-fetch";

const spotifyAccountsBaseUrl = "https://accounts.spotify.com";

const appTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});

let cachedAppToken: { accessToken: string; expiresAt: number } | null = null;

export async function getSpotifyAppAccessToken() {
  const refreshBufferMs = 60_000;

  if (cachedAppToken && cachedAppToken.expiresAt > Date.now() + refreshBufferMs) {
    return cachedAppToken.accessToken;
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = getSpotifyEnv();
  const response = await serverFetch(new URL("/api/token", spotifyAccountsBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error("Unable to fetch Spotify app access token");
  }

  const tokenResponse = appTokenResponseSchema.parse(payload);

  cachedAppToken = {
    accessToken: tokenResponse.access_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
  };

  return cachedAppToken.accessToken;
}
