import { Badge, ButtonLink, Card, Container, Skeleton } from "@/components/ui";

const previewStats = [
  { label: "Discovery Score", value: "33", hint: "Moderate Explorer" },
  { label: "Genre Diversity", value: "37%", hint: "3 core genres" },
  { label: "Repeat Listening", value: "60%", hint: "Comfort-zone signal" },
];

const featureCards = [
  {
    title: "Understand your habits",
    description:
      "See genre diversity, repeat listening, artist concentration, and recent discovery patterns in one dashboard.",
  },
  {
    title: "Get transparent AI picks",
    description:
      "Every recommendation explains why it fits your taste and how it nudges you beyond familiar tracks.",
  },
  {
    title: "Choose your path",
    description:
      "Try the full experience with sample data, or connect Spotify when you want a personalized profile.",
  },
];

type MarketingPageProps = {
  searchParams: Promise<{ authError?: string }>;
};

export default async function MarketingPage({ searchParams }: MarketingPageProps) {
  const { authError } = await searchParams;

  return (
    <main className="min-h-screen overflow-hidden">
      <Container className="relative py-6 sm:py-8">
        {authError ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <p className="font-semibold">Sign in failed</p>
            <p className="mt-1">{authError}</p>
          </div>
        ) : null}

        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              aria-hidden="true"
              className="h-10 w-10 shrink-0 text-[var(--color-brand)] sm:h-11 sm:w-11"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <div>
              <p className="text-base font-semibold tracking-wide text-white sm:text-lg">Spotify</p>
              <p className="text-sm text-zinc-400 sm:text-base">AI Music Discovery Coach</p>
            </div>
          </div>
          <Badge>Spotify MVP</Badge>
        </nav>

        <section className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <Badge className="mb-6">Demo + Spotify Login</Badge>
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
              Break out of your musical comfort zone.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
              AI Discovery Coach analyzes listening behavior, scores discovery habits,
              and recommends songs with clear reasoning so users can explore with confidence.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/api/demo" size="lg">
                Try Demo
              </ButtonLink>
              <ButtonLink href="/api/auth/login" variant="secondary" size="lg">
                Sign in with Spotify
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-zinc-400">
              Explore with sample data — no account needed.
            </p>
          </div>

          <Card className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[var(--color-brand)]/20 blur-3xl" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Preview Dashboard</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">Discovery Pulse</h2>
                </div>
                <Badge>Demo</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {previewStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="mt-4 text-3xl font-black text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-zinc-400">{stat.hint}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between text-sm text-zinc-300">
                  <span>Recommendation readiness</span>
                  <span>Loading sample insights</span>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 pb-16 md:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title} className="p-5">
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.description}</p>
            </Card>
          ))}
        </section>
      </Container>
    </main>
  );
}
