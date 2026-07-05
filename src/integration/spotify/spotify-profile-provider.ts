import "server-only";

import type { ListeningProfile } from "@/domain/profile/listening-profile";
import type { ProfileProvider } from "@/integration/profile-provider";
import type { AppSession } from "@/lib/auth/session-core";

import { SpotifyClient } from "./client";
import { mapSpotifyArtist, mapSpotifyPlaylist, mapSpotifyTrack } from "./mappers";

export class SpotifyProfileProvider implements ProfileProvider {
  async getProfile(session: AppSession): Promise<ListeningProfile> {
    if (session.mode !== "spotify") {
      throw new Error("SpotifyProfileProvider requires a Spotify session");
    }

    const client = new SpotifyClient({
      accessToken: session.accessToken,
    });

    const [topArtists, topTracks, recentlyPlayed, playlists] = await Promise.all([
      client.getTopArtists(),
      client.getTopTracks(),
      client.getRecentlyPlayed(),
      client.getPlaylists(),
    ]);

    const topArtistsMapped = topArtists.map(mapSpotifyArtist);
    const topArtistIds = new Set(topArtistsMapped.map((artist) => artist.id));
    const recentArtistIds = [
      ...new Set(
        recentlyPlayed.flatMap((item) => item.track.artists.map((artist) => artist.id)),
      ),
    ].filter((artistId) => !topArtistIds.has(artistId));
    const artistIdsNeedingGenres = [
      ...new Set([
        ...topArtistsMapped
          .filter((artist) => artist.genres.length === 0)
          .map((artist) => artist.id),
        ...recentArtistIds,
      ]),
    ];
    let enrichedTopArtists = topArtistsMapped;
    let genreArtists: ReturnType<typeof mapSpotifyArtist>[] = [];

    try {
      const fetchedArtists = (await client.getArtists(artistIdsNeedingGenres)).map(mapSpotifyArtist);
      const fetchedById = new Map(fetchedArtists.map((artist) => [artist.id, artist]));

      enrichedTopArtists = topArtistsMapped.map((artist) => {
        const fetched = fetchedById.get(artist.id);

        if (artist.genres.length === 0 && fetched?.genres.length) {
          return {
            ...artist,
            genres: fetched.genres,
          };
        }

        return artist;
      });
      genreArtists = fetchedArtists.filter((artist) => !topArtistIds.has(artist.id));
    } catch {
      genreArtists = [];
    }

    return {
      topArtists: enrichedTopArtists,
      topTracks: topTracks.map((track) => mapSpotifyTrack(track)),
      recentlyPlayed: recentlyPlayed.map((item) => mapSpotifyTrack(item.track, item.played_at)),
      playlists: playlists.map(mapSpotifyPlaylist),
      genreArtists,
    };
  }
}
