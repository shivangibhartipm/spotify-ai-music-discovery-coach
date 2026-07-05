import { Card } from "@/components/ui";
import type { MusicRecommendation } from "@/domain/recommendations";

export function RecommendationCard({
  recommendation,
}: {
  recommendation: MusicRecommendation;
}) {
  return (
    <Card className="animate-card-enter flex h-full flex-col overflow-hidden p-0 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]">
      <div
        className="aspect-square rounded-t-3xl bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.72), transparent 45%), url(${recommendation.albumArtworkUrl})`,
        }}
        aria-label={`${recommendation.songTitle} album artwork`}
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-brand-hover)]">
          {recommendation.genre}
        </p>
        <h3 className="mt-3 text-xl font-bold text-white">{recommendation.songTitle}</h3>
        <p className="mt-1 text-sm font-medium text-zinc-400">{recommendation.artist}</p>
        <p className="mt-4 flex-1 text-sm leading-6 text-zinc-300">{recommendation.explanation}</p>
        <a
          href={recommendation.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-brand)] px-4 text-sm font-bold text-black transition hover:bg-[var(--color-brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-2 focus:ring-offset-black"
        >
          Open in Spotify
        </a>
      </div>
    </Card>
  );
}
