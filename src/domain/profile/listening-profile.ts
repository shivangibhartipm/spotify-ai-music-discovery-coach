export type Artist = {
  id: string;
  name: string;
  genres: string[];
  imageUrl?: string;
  spotifyUrl?: string;
};

export type Track = {
  id: string;
  title: string;
  artistNames: string[];
  artistIds?: string[];
  albumName?: string;
  albumArtworkUrl?: string;
  genres?: string[];
  spotifyUrl?: string;
  playedAt?: string;
};

export type Playlist = {
  id: string;
  name: string;
  trackCount: number;
  imageUrl?: string;
  spotifyUrl?: string;
};

export type ListeningProfile = {
  topArtists: Artist[];
  topTracks: Track[];
  recentlyPlayed: Track[];
  playlists: Playlist[];
  genreArtists?: Artist[];
};
