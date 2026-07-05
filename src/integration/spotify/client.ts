import "server-only";

import { httpRequest } from "@/lib/http/client";
import {
  spotifyArtistsResponseSchema,
  spotifyErrorResponseSchema,
  spotifyPlaylistsResponseSchema,
  spotifyRecentlyPlayedResponseSchema,
  spotifyTopArtistsResponseSchema,
  spotifyTopTracksResponseSchema,
} from "@/lib/validation/spotify";

import { getSpotifyAppAccessToken } from "./app-token";

const spotifyApiBaseUrl = "https://api.spotify.com/v1";

type SpotifyClientOptions = {
  accessToken: string;
};

async function parseJsonResponse(response: Response) {
  const payload = await response.json();

  if (!response.ok) {
    const parsedError = spotifyErrorResponseSchema.safeParse(payload);
    const message =
      parsedError.success && parsedError.data.error
        ? typeof parsedError.data.error === "string"
          ? parsedError.data.error
          : parsedError.data.error.message
        : `Spotify request failed with status ${response.status}`;

    throw new Error(message || `Spotify request failed with status ${response.status}`);
  }

  return payload;
}

const spotifyTopItemsTimeRange = "short_term";

export class SpotifyClient {
  constructor(private readonly options: SpotifyClientOptions) {}

  private async get(
    path: string,
    searchParams?: Record<string, string>,
    accessToken = this.options.accessToken,
  ) {
    const url = new URL(path, spotifyApiBaseUrl);

    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        url.searchParams.set(key, value);
      }
    }

    const response = await httpRequest(
      url,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      {
        timeoutMs: 10_000,
        retries: 2,
      },
    );

    return parseJsonResponse(response);
  }

  async getTopArtists(limit = 20) {
    const payload = await this.get("/v1/me/top/artists", {
      limit: String(limit),
      time_range: spotifyTopItemsTimeRange,
    });

    return spotifyTopArtistsResponseSchema.parse(payload).items;
  }

  async getTopTracks(limit = 20) {
    const payload = await this.get("/v1/me/top/tracks", {
      limit: String(limit),
      time_range: spotifyTopItemsTimeRange,
    });

    return spotifyTopTracksResponseSchema.parse(payload).items;
  }

  async getRecentlyPlayed(limit = 50) {
    const payload = await this.get("/v1/me/player/recently-played", {
      limit: String(limit),
    });

    return spotifyRecentlyPlayedResponseSchema.parse(payload).items;
  }

  async getPlaylists(limit = 20) {
    const payload = await this.get("/v1/me/playlists", {
      limit: String(limit),
    });

    return spotifyPlaylistsResponseSchema.parse(payload).items.filter((playlist) => playlist !== null);
  }

  async getArtists(ids: string[]) {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length === 0) {
      return [];
    }

    const appAccessToken = await getSpotifyAppAccessToken();
    const artists = [];

    for (let index = 0; index < uniqueIds.length; index += 50) {
      const chunk = uniqueIds.slice(index, index + 50);
      const payload = await this.get(
        "/v1/artists",
        {
          ids: chunk.join(","),
        },
        appAccessToken,
      );

      artists.push(
        ...spotifyArtistsResponseSchema
          .parse(payload)
          .artists.filter((artist): artist is NonNullable<typeof artist> => artist !== null),
      );
    }

    return artists;
  }
}
