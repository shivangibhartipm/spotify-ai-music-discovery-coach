import type { ListeningProfile } from "@/domain/profile/listening-profile";

import {
  getArtistConcentration,
  getExplorationLevel,
  getGenreDiversity,
  getMostListenedArtists,
  getRecentlyDiscoveredArtists,
  getRepeatListening,
  type ArtistConcentration,
  type ArtistListeningCount,
  type ExplorationLevel,
  type GenreDiversity,
  type RecentlyDiscoveredArtist,
  type RepeatListening,
} from "./metrics";

export type AnalysisResult = {
  mostListenedArtists: ArtistListeningCount[];
  genreDiversity: GenreDiversity;
  artistConcentration: ArtistConcentration;
  repeatListening: RepeatListening;
  recentlyDiscoveredArtists: RecentlyDiscoveredArtist[];
  explorationLevel: ExplorationLevel;
  summary: {
    topArtistCount: number;
    topTrackCount: number;
    recentlyPlayedCount: number;
    playlistCount: number;
  };
};

export function analyzeProfile(profile: ListeningProfile): AnalysisResult {
  const genreDiversity = getGenreDiversity(profile);
  const artistConcentration = getArtistConcentration(profile);
  const repeatListening = getRepeatListening(profile);
  const recentlyDiscoveredArtists = getRecentlyDiscoveredArtists(profile);

  return {
    mostListenedArtists: getMostListenedArtists(profile),
    genreDiversity,
    artistConcentration,
    repeatListening,
    recentlyDiscoveredArtists,
    explorationLevel: getExplorationLevel(
      genreDiversity,
      artistConcentration,
      repeatListening,
      recentlyDiscoveredArtists,
    ),
    summary: {
      topArtistCount: profile.topArtists.length,
      topTrackCount: profile.topTracks.length,
      recentlyPlayedCount: profile.recentlyPlayed.length,
      playlistCount: profile.playlists.length,
    },
  };
}
