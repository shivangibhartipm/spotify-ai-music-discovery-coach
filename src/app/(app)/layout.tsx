import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Badge, ButtonLink, Container } from "@/components/ui";
import { getValidSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getValidSession();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen">
      <Container className="py-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
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
          </div>

          <div className="flex items-center gap-3">
            <Badge>{session.mode === "demo" ? "Demo mode" : "Spotify mode"}</Badge>
            {session.mode === "demo" ? (
              <ButtonLink href="/api/auth/login" variant="secondary" size="sm">
                Connect Spotify
              </ButtonLink>
            ) : null}
            <ButtonLink href="/api/auth/logout" variant="ghost" size="sm">
              Log out
            </ButtonLink>
          </div>
        </header>

        {session.mode === "demo" ? (
          <div className="mt-6 rounded-3xl border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/10 p-4 text-sm text-zinc-200 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <p>
              <span className="font-bold text-white">You are viewing sample data.</span>{" "}
              Connect Spotify when you want a personalized discovery profile.
            </p>
            <ButtonLink
              href="/api/auth/login"
              variant="secondary"
              size="sm"
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Connect Spotify
            </ButtonLink>
          </div>
        ) : null}

        {children}
      </Container>
    </main>
  );
}
