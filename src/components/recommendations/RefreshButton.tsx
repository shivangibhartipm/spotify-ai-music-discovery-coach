"use client";

type RefreshButtonProps = {
  isLoading: boolean;
  onRefresh: () => void;
};

export function RefreshButton({ isLoading, onRefresh }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isLoading}
      className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/15 disabled:pointer-events-none disabled:opacity-60"
    >
      {isLoading ? "Refreshing..." : "Refresh Recommendations"}
    </button>
  );
}
