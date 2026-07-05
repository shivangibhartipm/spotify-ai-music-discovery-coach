import type { AnalysisResult } from "@/domain/analysis";

import { createDiscoveryExplanation, createDiscoverySuggestions } from "./explanation";
import {
  calculateDiscoveryScore,
  getDiscoveryBand,
  type DiscoveryBand,
  type DiscoveryScoreBreakdown,
} from "./score";

export type DiscoveryScoreViewModel = {
  score: number;
  band: DiscoveryBand;
  explanation: string;
  suggestions: string[];
  breakdown: DiscoveryScoreBreakdown;
  genresAvailable: boolean;
};

export function getDiscoveryScore(analysis: AnalysisResult): DiscoveryScoreViewModel {
  const scoreResult = calculateDiscoveryScore(analysis);

  return {
    ...scoreResult,
    explanation: createDiscoveryExplanation(analysis, scoreResult),
    suggestions: createDiscoverySuggestions(analysis, scoreResult),
    genresAvailable: analysis.genreDiversity.genresAvailable,
  };
}

export { calculateDiscoveryScore, getDiscoveryBand };
export type { DiscoveryBand, DiscoveryScoreBreakdown };
