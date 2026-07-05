import type { AnalysisResult } from "@/domain/analysis";

import { ConcentrationChart } from "./ConcentrationChart";
import { DiversityChart } from "./DiversityChart";
import { StatTile } from "./StatTile";

function concentrationAccent(level: AnalysisResult["artistConcentration"]["concentrationLevel"]) {
  if (level === "High") {
    return "red";
  }

  if (level === "Medium") {
    return "amber";
  }

  return "green";
}

function repeatAccent(repeatPercentage: number) {
  if (repeatPercentage >= 70) {
    return "red";
  }

  if (repeatPercentage >= 40) {
    return "amber";
  }

  return "green";
}

export function InsightsOverview({ analysis }: { analysis: AnalysisResult }) {
  const recentlyDiscoveredNames = analysis.recentlyDiscoveredArtists
    .slice(0, 3)
    .map((artist) => artist.name);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Genre diversity"
          value={
            analysis.genreDiversity.genresAvailable
              ? `${analysis.genreDiversity.uniqueGenreCount} genres`
              : "Unavailable"
          }
          description={
            analysis.genreDiversity.genresAvailable
              ? `Diversity score ${analysis.genreDiversity.score}/100 from your top and recent listening.`
              : "Spotify has not tagged genres for your artists, so this metric is unavailable."
          }
        >
          <DiversityChart diversity={analysis.genreDiversity} />
        </StatTile>

        <StatTile
          label="Artist concentration"
          value={`${analysis.artistConcentration.topThreeArtistShare}%`}
          accent={concentrationAccent(analysis.artistConcentration.concentrationLevel)}
          description={`${analysis.artistConcentration.concentrationLevel} concentration across your top three artists.`}
        >
          <ConcentrationChart artists={analysis.mostListenedArtists} />
        </StatTile>

        <StatTile
          label="Repeat listening"
          value={`${analysis.repeatListening.repeatPercentage}%`}
          accent={repeatAccent(analysis.repeatListening.repeatPercentage)}
          description={`${analysis.repeatListening.repeatTrackCount} of ${analysis.repeatListening.totalRecentTracks} recent plays overlap with your top tracks.`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatTile
          label="Recently discovered"
          value={analysis.recentlyDiscoveredArtists.length}
          description={
            recentlyDiscoveredNames.length > 0
              ? `Recent artists outside your top list: ${recentlyDiscoveredNames.join(", ")}.`
              : "Your recent plays are mostly from familiar artists."
          }
        />

        <StatTile
          label="Exploration level"
          value={analysis.explorationLevel}
          accent={analysis.explorationLevel === "Comfort Zone" ? "amber" : "green"}
          description="Composite view of genre variety, concentration, repeat listening, and new artists."
        />
      </div>
    </div>
  );
}
