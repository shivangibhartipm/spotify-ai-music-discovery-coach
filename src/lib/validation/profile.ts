import { z } from "zod";

export const artistSchema = z.object({
  id: z.string(),
  name: z.string(),
  genres: z.array(z.string()),
  imageUrl: z.string().url().optional(),
  spotifyUrl: z.string().url().optional(),
});

export const trackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artistNames: z.array(z.string()),
  artistIds: z.array(z.string()).optional(),
  albumName: z.string().optional(),
  albumArtworkUrl: z.string().url().optional(),
  genres: z.array(z.string()).optional(),
  spotifyUrl: z.string().url().optional(),
  playedAt: z.string().optional(),
});

export const playlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  trackCount: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional(),
  spotifyUrl: z.string().url().optional(),
});

export const listeningProfileSchema = z.object({
  topArtists: z.array(artistSchema),
  topTracks: z.array(trackSchema),
  recentlyPlayed: z.array(trackSchema),
  playlists: z.array(playlistSchema),
  genreArtists: z.array(artistSchema).optional().default([]),
});
