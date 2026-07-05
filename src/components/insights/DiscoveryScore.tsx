import { Card } from "@/components/ui";
import type { DiscoveryScoreViewModel } from "@/domain/scoring";

const breakdownLabels: Record<keyof DiscoveryScoreViewModel["breakdown"], string> = {
  genreDiversity: "Genre diversity",
  artistSpread: "Artist spread",
  freshness: "Freshness",
  newDiscovery: "New discovery",
};

function scoreAccent(score: number) {
  if (score <= 30) {
    return "text-red-300";
  }

  if (score <= 60) {
    return "text-amber-300";
  }

  return "text-[var(--color-brand-hover)]";
}

function progressColor(score: number) {
  if (score <= 30) {
    return "bg-red-300";
  }

  if (score <= 60) {
    return "bg-amber-300";
  }

  return "bg-[var(--color-brand)]";
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function DiscoveryScore({ discoveryScore }: { discoveryScore: DiscoveryScoreViewModel }) {
  return (
    <Card className="animate-card-enter overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="border-b border-white/10 bg-black/25 p-6 lg:border-b-0 lg:border-r">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Discovery Score</p>
          <div className="mt-5 flex items-end gap-3">
            <span className={`text-7xl font-black tracking-[-0.08em] ${scoreAccent(discoveryScore.score)}`}>
              {discoveryScore.score}
            </span>
            <span className="pb-3 text-lg font-bold text-zinc-500">/100</span>
          </div>
          <p className="mt-3 text-xl font-bold text-white">{discoveryScore.band}</p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${progressColor(discoveryScore.score)}`}
              style={{ width: `${clampPercent(discoveryScore.score)}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">How your score was calculated</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">{discoveryScore.explanation}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(discoveryScore.breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>{breakdownLabels[key as keyof DiscoveryScoreViewModel["breakdown"]]}</span>
                  <span>
                    {key === "genreDiversity" && !discoveryScore.genresAvailable
                      ? "N/A"
                      : `${value}/100`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/70"
                    style={{
                      width: `${
                        key === "genreDiversity" && !discoveryScore.genresAvailable
                          ? 0
                          : clampPercent(value)
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="text-sm font-bold text-white">Suggestions</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {discoveryScore.suggestions.map((suggestion) => (
                <li key={suggestion} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-brand)]" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
