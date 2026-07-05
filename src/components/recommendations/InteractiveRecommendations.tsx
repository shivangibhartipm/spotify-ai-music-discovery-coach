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

async function readJsonResponse<T>(response: Response) {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new Error("The server returned an unexpected response. Please refresh the page and try again.");
  }

  return (await response.json()) as T;
}

export function InteractiveRecommendations({
  initialRecommendations,
  sessionToken,
}: {
  initialRecommendations: MusicRecommendation[];
  sessionToken?: string | null;
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
        const response = await fetch("/api/recommendations", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { "X-ADC-Session-Token": sessionToken } : {}),
          },
          body: JSON.stringify({
            excludedIds,
          }),
        });
        const payload = await readJsonResponse<RecommendationsResponse>(response);

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
        const response = await fetch("/api/surprise", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: sessionToken ? { "X-ADC-Session-Token": sessionToken } : undefined,
        });
        const payload = await readJsonResponse<SurpriseResponse>(response);

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
