import type { MusicRecommendation } from "@/domain/recommendations";
import { Skeleton } from "@/components/ui";

import { RecommendationCard } from "./RecommendationCard";

export function RecommendationGrid({
  recommendations,
}: {
  recommendations: MusicRecommendation[];
}) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm leading-6 text-zinc-400">
        No recommendations are available yet. Try refreshing, or connect Spotify if you are viewing
        demo data.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {recommendations.map((recommendation) => (
        <RecommendationCard key={recommendation.id} recommendation={recommendation} />
      ))}
    </div>
  );
}

export function RecommendationSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-0"
        >
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
