"use client";

import { useMemo, useState, useTransition } from "react";

import type { MusicRecommendation, SurpriseRecommendation } from "@/domain/recommendations";

import { RecommendationGrid, RecommendationSkeletonGrid } from "./RecommendationGrid";
import { RefreshButton } from "./RefreshButton";
import { SurpriseModal } from "./SurpriseModal";

type RecommendationsResponse = {
  recommendations?: MusicRecommendation[];
  error?: string;
};

type SurpriseResponse = {
  recommendation?: SurpriseRecommendation;
  error?: string;
};

export function InteractiveRecommendations({
  initialRecommendations,
}: {
  initialRecommendations: MusicRecommendation[];
}) {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [error, setError] = useState<string | null>(null);
  const [surpriseError, setSurpriseError] = useState<string | null>(null);
  const [surprise, setSurprise] = useState<SurpriseRecommendation | null>(null);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSurprisePending, startSurpriseTransition] = useTransition();
  const excludedIds = useMemo(
    () => recommendations.map((recommendation) => recommendation.id),
    [recommendations],
  );

  function refreshRecommendations() {
    startTransition(async () => {
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        searchParams.set("mode", "refresh");

        for (const id of excludedIds) {
          searchParams.append("exclude", id);
        }

        const response = await fetch(`/api/recommendations?${searchParams.toString()}`);
        const payload = (await response.json()) as RecommendationsResponse;

        if (!response.ok || !payload.recommendations) {
          throw new Error(payload.error ?? "Unable to refresh recommendations.");
        }

        setRecommendations(payload.recommendations);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to refresh recommendations.",
        );
      }
    });
  }

  function requestSurprise() {
    startSurpriseTransition(async () => {
      setSurpriseError(null);
      setSurprise(null);
      setIsSurpriseOpen(true);

      try {
        const response = await fetch("/api/surprise");
        const payload = (await response.json()) as SurpriseResponse;

        if (!response.ok || !payload.recommendation) {
          throw new Error(payload.error ?? "Unable to generate a surprise recommendation.");
        }

        setSurprise(payload.recommendation);
      } catch (caughtError) {
        setSurprise(null);
        setSurpriseError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to generate a surprise recommendation.",
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <RefreshButton isLoading={isPending} onRefresh={refreshRecommendations} />
        <SurpriseModal
          recommendation={surprise}
          error={surpriseError}
          isLoading={isSurprisePending}
          isOpen={isSurpriseOpen}
          onClose={() => setIsSurpriseOpen(false)}
          onSurprise={requestSurprise}
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {isPending ? (
        <RecommendationSkeletonGrid />
      ) : (
        <RecommendationGrid recommendations={recommendations} />
      )}
    </div>
  );
}
