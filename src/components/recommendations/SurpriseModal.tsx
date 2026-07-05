"use client";

import type { SurpriseRecommendation } from "@/domain/recommendations";

type SurpriseModalProps = {
  recommendation: SurpriseRecommendation | null;
  error: string | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSurprise: () => void;
};

export function SurpriseModal({
  recommendation,
  error,
  isLoading,
  isOpen,
  onClose,
  onSurprise,
}: SurpriseModalProps) {
  return (
    <>
      <button
        type="button"
        onClick={onSurprise}
        disabled={isLoading}
        className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-brand)] px-4 text-sm font-bold text-black transition hover:bg-[var(--color-brand-hover)] disabled:pointer-events-none disabled:opacity-60"
      >
        {isLoading ? "Finding surprise..." : "Surprise Me"}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur">
          <div className="animate-card-enter w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#121212] shadow-card">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-brand-hover)]">
                  Surprise Me
                </p>
                <h3 className="mt-1 text-2xl font-bold text-white">
                  {recommendation?.songTitle ?? "Discovery pick"}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-2 focus:ring-offset-black"
              >
                Close
              </button>
            </div>

            {error ? (
              <div className="p-6 text-sm leading-6 text-red-200">{error}</div>
            ) : null}

            {recommendation ? (
              <div className="grid gap-0 md:grid-cols-[0.8fr_1.2fr]">
                <div
                  className="min-h-72 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65), transparent 45%), url(${recommendation.albumArtworkUrl})`,
                  }}
                />
                <div className="p-6">
                  <p className="text-sm font-semibold text-zinc-400">{recommendation.artist}</p>
                  <p className="mt-2 inline-flex rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-hover)]">
                    {recommendation.explorationLevel}
                  </p>
                  <div className="mt-6 space-y-5 text-sm leading-6 text-zinc-300">
                    <div>
                      <h4 className="font-bold text-white">Why this is surprising</h4>
                      <p className="mt-1">{recommendation.whySurprising}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Why you may still enjoy it</h4>
                      <p className="mt-1">{recommendation.whyUserMayEnjoyIt}</p>
                    </div>
                  </div>
                  <a
                    href={recommendation.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 text-sm font-bold text-black transition hover:bg-[var(--color-brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-2 focus:ring-offset-black"
                  >
                    Open in Spotify
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
