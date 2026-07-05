import { analyzeProfile } from "@/domain/analysis";
import { getMusicRecommendations } from "@/domain/recommendations";
import { getDiscoveryScore } from "@/domain/scoring";
import { Badge, Card } from "@/components/ui";
import { DiscoveryScore } from "@/components/insights/DiscoveryScore";
import { InsightsOverview } from "@/components/insights/InsightsOverview";
import { InteractiveRecommendations } from "@/components/recommendations/InteractiveRecommendations";
import { getProfileProvider } from "@/integration/profile-provider";
import { getValidSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getValidSession();
  const profileResult = await (async () => {
    if (!session) {
      return {
        profile: null,
        error: "No active session found.",
      };
    }

    try {
      const provider = getProfileProvider(session);

      return {
        profile: await provider.getProfile(session),
        error: null,
      };
    } catch (error) {
      return {
        profile: null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the listening profile right now.",
      };
    }
  })();
  const profile = profileResult.profile;
  const analysis = profile ? analyzeProfile(profile) : null;
  const discoveryScore = analysis ? getDiscoveryScore(analysis) : null;
  const recommendationResult = await (async () => {
    if (!profile || !session) {
      return {
        recommendations: [],
        error: null,
      };
    }

    try {
      return {
        recommendations: await getMusicRecommendations({
          profile,
          session,
        }),
        error: null,
      };
    } catch (error) {
      return {
        recommendations: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate recommendations right now.",
      };
    }
  })();
  const hasProfileData =
    profile &&
    (profile.topArtists.length > 0 ||
      profile.topTracks.length > 0 ||
      profile.recentlyPlayed.length > 0 ||
      profile.playlists.length > 0);

  return (
    <section className="py-10">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
          Your music discovery health, scored and explained.
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Top artists</p>
          <p className="mt-4 text-3xl font-black capitalize text-white">
            {profile?.topArtists.length ?? 0}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            {analysis && analysis.mostListenedArtists.length > 0
              ? analysis.mostListenedArtists
                  .slice(0, 3)
                  .map((artist) => artist.name)
                  .join(", ")
              : "No artist data loaded yet."}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Unique genres</p>
          <p className="mt-4 text-3xl font-black text-white">
            {analysis?.genreDiversity.genresAvailable
              ? analysis.genreDiversity.uniqueGenreCount
              : "—"}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            {analysis?.genreDiversity.genresAvailable
              ? `Leading genre: ${analysis.genreDiversity.topGenres[0]?.genre}`
              : session?.mode === "spotify"
                ? "Genres unavailable from Spotify for your artists."
                : "No genre data loaded yet."}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Exploration</p>
          <p className="mt-4 text-3xl font-black text-white">
            {analysis?.explorationLevel ?? "Unknown"}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            {analysis
              ? `${analysis.repeatListening.repeatPercentage}% repeat listening detected.`
              : "Analysis has not run yet."}
          </p>
        </Card>
      </div>

      {profileResult.error ? (
        <Card className="mt-4 border-red-500/30 bg-red-500/10">
          <h2 className="text-xl font-bold text-red-100">Profile load failed</h2>
          <p className="mt-3 text-sm leading-6 text-red-200">{profileResult.error}</p>
        </Card>
      ) : null}

      {!profileResult.error && !hasProfileData ? (
        <Card className="mt-4">
          <h2 className="text-xl font-bold text-white">No listening data yet</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            We could not find enough artists, tracks, or recent plays to analyze. Try listening on
            Spotify first, or switch to Demo mode to see the full experience.
          </p>
        </Card>
      ) : null}

      {discoveryScore ? (
        <section className="mt-8">
          <DiscoveryScore discoveryScore={discoveryScore} />
        </section>
      ) : null}

      {analysis ? (
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">Insight breakdown</h2>
            <p className="mt-2 text-sm text-zinc-400">
              These metrics feed the Discovery Score and will inform AI recommendation prompts.
            </p>
          </div>
          <InsightsOverview analysis={analysis} />
        </section>
      ) : null}

      {analysis ? (
        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">AI recommendations</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Five personalized picks with transparent reasoning and Spotify links.
              </p>
            </div>
            {session?.mode === "demo" ? (
              <Badge>Cached demo AI</Badge>
            ) : null}
          </div>

          {recommendationResult.error ? (
            <Card className="border-red-500/30 bg-red-500/10">
              <h3 className="text-xl font-bold text-red-100">Recommendations failed</h3>
              <p className="mt-3 text-sm leading-6 text-red-200">
                {recommendationResult.error}
              </p>
            </Card>
          ) : (
            <InteractiveRecommendations
              initialRecommendations={recommendationResult.recommendations}
            />
          )}
        </section>
      ) : null}
    </section>
  );
}
