import type { GenreDiversity } from "@/domain/analysis/metrics";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function DiversityChart({ diversity }: { diversity: GenreDiversity }) {
  if (!diversity.genresAvailable) {
    return (
      <p className="text-sm text-zinc-500">
        Spotify has not tagged genres for your artists, so genre diversity cannot be calculated.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {diversity.topGenres.map((genre) => (
        <div key={genre.genre}>
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span className="capitalize">{genre.genre}</span>
            <span>{genre.share}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--color-brand)]"
              style={{ width: `${clampPercent(genre.share)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
