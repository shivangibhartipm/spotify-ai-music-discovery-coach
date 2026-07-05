import { z } from "zod";

const spotifyExternalUrlsSchema = z
  .object({
    spotify: z.string().url().optional(),
  })
  .default({});

const spotifyImageSchema = z.object({
  url: z.string().url(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
});

const spotifyArtistSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  external_urls: spotifyExternalUrlsSchema.optional(),
});

export const spotifyArtistSchema = spotifyArtistSummarySchema.extend({
  genres: z.array(z.string()).default([]),
  images: z.array(spotifyImageSchema).default([]),
});

const spotifyAlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  images: z.array(spotifyImageSchema).default([]),
});

export const spotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(spotifyArtistSummarySchema),
  album: spotifyAlbumSchema,
  external_urls: spotifyExternalUrlsSchema.optional(),
});

export const spotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  images: z.array(spotifyImageSchema).nullable().default([]),
  external_urls: spotifyExternalUrlsSchema.optional(),
  tracks: z.object({
    total: z.number().int().nonnegative(),
  }),
});

export const spotifyTopArtistsResponseSchema = z.object({
  items: z.array(spotifyArtistSchema),
});

export const spotifyArtistsResponseSchema = z.object({
  artists: z.array(spotifyArtistSchema.nullable()).default([]),
});

export const spotifyTopTracksResponseSchema = z.object({
  items: z.array(spotifyTrackSchema),
});

export const spotifyRecentlyPlayedResponseSchema = z.object({
  items: z.array(
    z.object({
      track: spotifyTrackSchema,
      played_at: z.string(),
    }),
  ),
});

export const spotifyPlaylistsResponseSchema = z.object({
  items: z.array(spotifyPlaylistSchema.nullable()).default([]),
});

export const spotifyErrorResponseSchema = z.object({
  error: z
    .object({
      status: z.number().optional(),
      message: z.string().optional(),
    })
    .or(z.string())
    .optional(),
});

export type SpotifyArtist = z.infer<typeof spotifyArtistSchema>;
export type SpotifyTrack = z.infer<typeof spotifyTrackSchema>;
export type SpotifyPlaylist = z.infer<typeof spotifyPlaylistSchema>;
