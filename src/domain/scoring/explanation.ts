import type { AnalysisResult } from "@/domain/analysis";

import type { DiscoveryScoreBreakdown, DiscoveryScoreResult } from "./score";

type BreakdownKey = keyof DiscoveryScoreBreakdown;

const signalLabels: Record<BreakdownKey, string> = {
  genreDiversity: "genre diversity",
  artistSpread: "artist spread",
  freshness: "freshness",
  newDiscovery: "new discovery",
};

const suggestions: Record<BreakdownKey, string> = {
  genreDiversity: "Try one playlist outside your top genres this week.",
  artistSpread: "Pick one artist outside your usual top three and listen to three tracks.",
  freshness: "Skip your usual repeat playlist once and use Surprise Me instead.",
  newDiscovery: "Listen to three songs from artists who are not already in your top list.",
};

function weakestSignals(breakdown: DiscoveryScoreBreakdown, genresAvailable: boolean) {
  return (Object.entries(breakdown) as [BreakdownKey, number][])
    .filter(([key]) => genresAvailable || key !== "genreDiversity")
    .sort((first, second) => first[1] - second[1])
    .slice(0, 2);
}

function formatSignalList(signals: [BreakdownKey, number][]) {
  return signals.map(([key, value]) => `${signalLabels[key]} (${value}/100)`).join(" and ");
}

export function createDiscoveryExplanation(
  analysis: AnalysisResult,
  scoreResult: DiscoveryScoreResult,
) {
  const genresAvailable = analysis.genreDiversity.genresAvailable;
  const weakSignals = weakestSignals(scoreResult.breakdown, genresAvailable);
  const topArtistShare = analysis.artistConcentration.topThreeArtistShare;
  const repeatPercentage = analysis.repeatListening.repeatPercentage;
  const genreDetail = genresAvailable
    ? `You currently lean on ${analysis.genreDiversity.uniqueGenreCount} genres`
    : "Spotify has not tagged genres for your artists, so genre diversity was excluded from scoring";

  if (scoreResult.score <= 30) {
    return `Your Discovery Score is ${scoreResult.score}, which places you in the ${scoreResult.band} band. Your weakest signals are ${formatSignalList(
      weakSignals,
    )}. ${genreDetail}, your top three artists make up ${topArtistShare}% of top-track listening, and ${repeatPercentage}% of recent plays overlap with your top tracks.`;
  }

  if (scoreResult.score <= 60) {
    return `Your Discovery Score is ${scoreResult.score}, which places you in the ${scoreResult.band} band. You are exploring in places, but ${formatSignalList(
      weakSignals,
    )} still pull you back toward familiar listening.`;
  }

  if (scoreResult.score <= 80) {
    return `Your Discovery Score is ${scoreResult.score}, which places you in the ${scoreResult.band} band. Your listening has solid variety, with room to improve ${formatSignalList(
      weakSignals,
    )}.`;
  }

  return `Your Discovery Score is ${scoreResult.score}, which places you in the ${scoreResult.band} band. Your profile shows strong variety, low repetition, and consistent movement beyond familiar artists.`;
}

export function createDiscoverySuggestions(
  analysis: AnalysisResult,
  scoreResult: DiscoveryScoreResult,
) {
  return weakestSignals(scoreResult.breakdown, analysis.genreDiversity.genresAvailable).map(
    ([key]) => suggestions[key],
  );
}
