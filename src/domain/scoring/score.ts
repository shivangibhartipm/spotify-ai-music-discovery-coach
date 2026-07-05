import type { AnalysisResult } from "@/domain/analysis";

export type DiscoveryBand =
  | "Comfort Zone Listener"
  | "Moderate Explorer"
  | "Active Explorer"
  | "Discovery Expert";

export type DiscoveryScoreBreakdown = {
  genreDiversity: number;
  artistSpread: number;
  freshness: number;
  newDiscovery: number;
};

export type DiscoveryScoreResult = {
  score: number;
  band: DiscoveryBand;
  breakdown: DiscoveryScoreBreakdown;
};

const weights = {
  genreDiversity: 0.3,
  artistSpread: 0.25,
  freshness: 0.25,
  newDiscovery: 0.2,
} satisfies Record<keyof DiscoveryScoreBreakdown, number>;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getDiscoveryBand(score: number): DiscoveryBand {
  if (score <= 30) {
    return "Comfort Zone Listener";
  }

  if (score <= 60) {
    return "Moderate Explorer";
  }

  if (score <= 80) {
    return "Active Explorer";
  }

  return "Discovery Expert";
}

export function calculateDiscoveryBreakdown(analysis: AnalysisResult): DiscoveryScoreBreakdown {
  return {
    genreDiversity: clampScore(analysis.genreDiversity.score),
    artistSpread: clampScore(100 - analysis.artistConcentration.topThreeArtistShare),
    freshness: clampScore(100 - analysis.repeatListening.repeatPercentage),
    newDiscovery: clampScore(analysis.recentlyDiscoveredArtists.length * 15),
  };
}

export function calculateDiscoveryScore(analysis: AnalysisResult): DiscoveryScoreResult {
  const breakdown = calculateDiscoveryBreakdown(analysis);
  const genresAvailable = analysis.genreDiversity.genresAvailable;
  const score = genresAvailable
    ? clampScore(
        breakdown.genreDiversity * weights.genreDiversity +
          breakdown.artistSpread * weights.artistSpread +
          breakdown.freshness * weights.freshness +
          breakdown.newDiscovery * weights.newDiscovery,
      )
    : clampScore(
        (breakdown.artistSpread * weights.artistSpread +
          breakdown.freshness * weights.freshness +
          breakdown.newDiscovery * weights.newDiscovery) /
          (weights.artistSpread + weights.freshness + weights.newDiscovery),
      );

  return {
    score,
    band: getDiscoveryBand(score),
    breakdown,
  };
}
