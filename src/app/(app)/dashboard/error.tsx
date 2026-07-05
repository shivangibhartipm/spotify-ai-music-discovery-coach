"use client";

import { Button, Card } from "@/components/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="py-10">
      <Card className="border-red-500/30 bg-red-500/10">
        <p className="text-xs uppercase tracking-[0.2em] text-red-200">Dashboard error</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
          We could not load your discovery dashboard.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-red-100">
          Spotify, Groq, or another external service may be temporarily unavailable. Try again in a
          moment.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <p className="mt-4 rounded-2xl border border-red-500/20 bg-black/20 p-3 text-xs text-red-100">
            {error.message}
          </p>
        ) : null}
        <Button type="button" onClick={reset} className="mt-6">
          Try again
        </Button>
      </Card>
    </section>
  );
}
