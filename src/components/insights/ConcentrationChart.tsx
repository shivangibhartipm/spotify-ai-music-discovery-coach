import type { ArtistListeningCount } from "@/domain/analysis/metrics";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function ConcentrationChart({ artists }: { artists: ArtistListeningCount[] }) {
  if (artists.length === 0) {
    return <p className="text-sm text-zinc-500">No artist concentration data available yet.</p>;
  }

  return (
    <div className="space-y-3">
      {artists.map((artist) => (
        <div key={artist.name}>
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span>{artist.name}</span>
            <span>{artist.share}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white/70"
              style={{ width: `${clampPercent(artist.share)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
