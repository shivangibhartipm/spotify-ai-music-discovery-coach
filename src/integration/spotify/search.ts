import "server-only";

import { z } from "zod";

import { httpRequest } from "@/lib/http/client";
import type {
  LlmRecommendation,
  LlmSurpriseRecommendation,
  MusicRecommendation,
  SurpriseRecommendation,
} from "@/lib/validation/recommendations";

const spotifyApiBaseUrl = "https://api.spotify.com/v1";
const fallbackArtworkUrl = "https://placehold.co/640x640/121212/1DB954?text=AI+Discovery";

const searchTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  external_urls: z
    .object({
      spotify: z.string().url().optional(),
    })
    .optional(),
  album: z.object({
    images: z
      .array(
        z.object({
          url: z.string().url(),
        }),
      )
      .default([]),
  }),
});

const spotifySearchResponseSchema = z.object({
  tracks: z.object({
    items: z.array(searchTrackSchema),
  }),
});

function fallbackSpotifySearchUrl(recommendation: LlmRecommendation) {
  const query = encodeURIComponent(`${recommendation.songTitle} ${recommendation.artist}`);

  return `https://open.spotify.com/search/${query}`;
}

function fallbackId(recommendation: LlmRecommendation) {
  return `${recommendation.songTitle}-${recommendation.artist}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function enrichRecommendationWithSpotify(
  recommendation: LlmRecommendation,
  accessToken?: string,
): Promise<MusicRecommendation> {
  if (!accessToken) {
    return {
      ...recommendation,
      id: fallbackId(recommendation),
      albumArtworkUrl: fallbackArtworkUrl,
      spotifyUrl: fallbackSpotifySearchUrl(recommendation),
    };
  }

  try {
    const url = new URL("/v1/search", spotifyApiBaseUrl);
    url.searchParams.set("type", "track");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", `track:${recommendation.songTitle} artist:${recommendation.artist}`);

    const response = await httpRequest(
      url,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      {
        timeoutMs: 10_000,
        retries: 1,
      },
    );
    const payload = spotifySearchResponseSchema.parse(await response.json());
    const track = payload.tracks.items[0];

    if (!track) {
      throw new Error("Spotify Search returned no matching track");
    }

    return {
      ...recommendation,
      id: track.id,
      albumArtworkUrl: track.album.images[0]?.url ?? fallbackArtworkUrl,
      spotifyUrl: track.external_urls?.spotify ?? fallbackSpotifySearchUrl(recommendation),
    };
  } catch {
    return {
      ...recommendation,
      id: fallbackId(recommendation),
      albumArtworkUrl: fallbackArtworkUrl,
      spotifyUrl: fallbackSpotifySearchUrl(recommendation),
    };
  }
}

export async function enrichSurpriseRecommendationWithSpotify(
  recommendation: LlmSurpriseRecommendation,
  accessToken?: string,
): Promise<SurpriseRecommendation> {
  const enriched = await enrichRecommendationWithSpotify(
    {
      songTitle: recommendation.songTitle,
      artist: recommendation.artist,
      genre: recommendation.genre,
      explanation: recommendation.whyUserMayEnjoyIt,
    },
    accessToken,
  );

  return {
    ...recommendation,
    id: enriched.id,
    albumArtworkUrl: enriched.albumArtworkUrl,
    spotifyUrl: enriched.spotifyUrl,
  };
}
