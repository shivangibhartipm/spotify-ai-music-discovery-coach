import type { Artist, Playlist, Track } from "@/domain/profile/listening-profile";
import type { SpotifyArtist, SpotifyPlaylist, SpotifyTrack } from "@/lib/validation/spotify";

function pickImageUrl(images: { url: string }[] | null | undefined) {
  return images?.[0]?.url;
}

export function mapSpotifyArtist(artist: SpotifyArtist): Artist {
  return {
    id: artist.id,
    name: artist.name,
    genres: artist.genres,
    imageUrl: pickImageUrl(artist.images),
    spotifyUrl: artist.external_urls?.spotify,
  };
}

export function mapSpotifyTrack(track: SpotifyTrack, playedAt?: string): Track {
  return {
    id: track.id,
    title: track.name,
    artistNames: track.artists.map((artist) => artist.name),
    artistIds: track.artists.map((artist) => artist.id),
    albumName: track.album.name,
    albumArtworkUrl: pickImageUrl(track.album.images),
    spotifyUrl: track.external_urls?.spotify,
    playedAt,
  };
}

export function mapSpotifyPlaylist(playlist: SpotifyPlaylist): Playlist {
  return {
    id: playlist.id,
    name: playlist.name,
    trackCount: playlist.tracks.total,
    imageUrl: pickImageUrl(playlist.images),
    spotifyUrl: playlist.external_urls?.spotify,
  };
}
