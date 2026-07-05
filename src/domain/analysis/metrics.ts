import type { ListeningProfile, Track } from "@/domain/profile/listening-profile";

export type ArtistListeningCount = {
  name: string;
  count: number;
  share: number;
};

export type GenreDiversity = {
  uniqueGenreCount: number;
  totalGenreMentions: number;
  topGenres: { genre: string; count: number; share: number }[];
  score: number;
  genresAvailable: boolean;
};

export type ArtistConcentration = {
  topArtistShare: number;
  topThreeArtistShare: number;
  concentrationLevel: "Low" | "Medium" | "High";
};

export type RepeatListening = {
  repeatTrackCount: number;
  totalRecentTracks: number;
  repeatPercentage: number;
};

export type RecentlyDiscoveredArtist = {
  name: string;
  trackCount: number;
};

export type ExplorationLevel = "Comfort Zone" | "Balanced Explorer" | "Active Explorer";

function percentage(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function sortCounts<T extends { count: number; name?: string; genre?: string }>(items: T[]) {
  return [...items].sort((first, second) => {
    if (second.count !== first.count) {
      return second.count - first.count;
    }

    return (first.name ?? first.genre ?? "").localeCompare(second.name ?? second.genre ?? "");
  });
}

function countTrackArtists(tracks: Track[]) {
  const counts = new Map<string, { name: string; count: number }>();

  for (const track of tracks) {
    for (const artistName of track.artistNames) {
      const key = normalizeName(artistName);
      const current = counts.get(key);

      counts.set(key, {
        name: artistName,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return counts;
}

export function getMostListenedArtists(profile: ListeningProfile, limit = 5): ArtistListeningCount[] {
  const counts = countTrackArtists([...profile.topTracks, ...profile.recentlyPlayed]);
  const totalMentions = [...counts.values()].reduce((sum, artist) => sum + artist.count, 0);

  return sortCounts([...counts.values()])
    .slice(0, limit)
    .map((artist) => ({
      name: artist.name,
      count: artist.count,
      share: percentage(artist.count, totalMentions),
    }));
}

function addGenreCounts(genreCounts: Map<string, number>, genres: string[], weight = 1) {
  for (const genre of genres) {
    const key = genre.trim().toLowerCase();

    if (key) {
      genreCounts.set(key, (genreCounts.get(key) ?? 0) + weight);
    }
  }
}

function buildArtistGenreLookup(profile: ListeningProfile) {
  const artistGenres = new Map<string, string[]>();

  for (const artist of profile.topArtists) {
    artistGenres.set(artist.id, artist.genres);
  }

  for (const artist of profile.genreArtists ?? []) {
    if (!artistGenres.has(artist.id)) {
      artistGenres.set(artist.id, artist.genres);
    }
  }

  return artistGenres;
}

export function getGenreDiversity(profile: ListeningProfile): GenreDiversity {
  const genreCounts = new Map<string, number>();
  const artistGenres = buildArtistGenreLookup(profile);

  for (const artist of profile.topArtists) {
    addGenreCounts(genreCounts, artist.genres);
  }

  for (const track of profile.recentlyPlayed) {
    if (track.genres?.length) {
      addGenreCounts(genreCounts, track.genres);
      continue;
    }

    for (const artistId of track.artistIds ?? []) {
      const genres = artistGenres.get(artistId);

      if (genres?.length) {
        addGenreCounts(genreCounts, genres);
      }
    }
  }

  const totalGenreMentions = [...genreCounts.values()].reduce((sum, count) => sum + count, 0);
  const topGenres = sortCounts(
    [...genreCounts.entries()].map(([genre, count]) => ({
      genre,
      count,
      share: percentage(count, totalGenreMentions),
    })),
  ).slice(0, 5);

  return {
    uniqueGenreCount: genreCounts.size,
    totalGenreMentions,
    topGenres,
    score: Math.min(100, Math.round((genreCounts.size / 8) * 100)),
    genresAvailable: genreCounts.size > 0,
  };
}

export function getArtistConcentration(profile: ListeningProfile): ArtistConcentration {
  const counts = sortCounts([...countTrackArtists(profile.topTracks).values()]);
  const totalMentions = counts.reduce((sum, artist) => sum + artist.count, 0);
  const topArtistCount = counts[0]?.count ?? 0;
  const topThreeCount = counts.slice(0, 3).reduce((sum, artist) => sum + artist.count, 0);
  const topThreeArtistShare = percentage(topThreeCount, totalMentions);

  return {
    topArtistShare: percentage(topArtistCount, totalMentions),
    topThreeArtistShare,
    concentrationLevel:
      topThreeArtistShare >= 70 ? "High" : topThreeArtistShare >= 45 ? "Medium" : "Low",
  };
}

export function getRepeatListening(profile: ListeningProfile): RepeatListening {
  const topTrackIds = new Set(profile.topTracks.map((track) => track.id));
  const repeatTrackCount = profile.recentlyPlayed.filter((track) => topTrackIds.has(track.id)).length;

  return {
    repeatTrackCount,
    totalRecentTracks: profile.recentlyPlayed.length,
    repeatPercentage: percentage(repeatTrackCount, profile.recentlyPlayed.length),
  };
}

export function getRecentlyDiscoveredArtists(profile: ListeningProfile): RecentlyDiscoveredArtist[] {
  const topArtistNames = new Set(profile.topArtists.map((artist) => normalizeName(artist.name)));
  const recentCounts = countTrackArtists(profile.recentlyPlayed);
  const discoveredArtists = [...recentCounts.values()].filter(
    (artist) => !topArtistNames.has(normalizeName(artist.name)),
  );

  return sortCounts(discoveredArtists).map((artist) => ({
    name: artist.name,
    trackCount: artist.count,
  }));
}

export function getExplorationLevel(
  genreDiversity: GenreDiversity,
  concentration: ArtistConcentration,
  repeatListening: RepeatListening,
  recentlyDiscoveredArtists: RecentlyDiscoveredArtist[],
): ExplorationLevel {
  let explorationScore = 0;

  if (genreDiversity.genresAvailable) {
    explorationScore += genreDiversity.score * 0.35;
    explorationScore += (100 - concentration.topThreeArtistShare) * 0.25;
    explorationScore += (100 - repeatListening.repeatPercentage) * 0.25;
    explorationScore += Math.min(100, recentlyDiscoveredArtists.length * 20) * 0.15;
  } else {
    const scale = 1 / 0.65;

    explorationScore += (100 - concentration.topThreeArtistShare) * 0.25 * scale;
    explorationScore += (100 - repeatListening.repeatPercentage) * 0.25 * scale;
    explorationScore += Math.min(100, recentlyDiscoveredArtists.length * 20) * 0.15 * scale;
  }

  if (explorationScore >= 65) {
    return "Active Explorer";
  }

  if (explorationScore >= 40) {
    return "Balanced Explorer";
  }

  return "Comfort Zone";
}
