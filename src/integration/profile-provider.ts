import type { ListeningProfile } from "@/domain/profile/listening-profile";
import { FixtureProfileProvider } from "@/integration/fixture/fixture-profile-provider";
import { SpotifyProfileProvider } from "@/integration/spotify/spotify-profile-provider";
import type { AppSession } from "@/lib/auth/session-core";

export interface ProfileProvider {
  getProfile(session: AppSession): Promise<ListeningProfile>;
}

export function getProfileProvider(session: AppSession): ProfileProvider {
  if (session.mode === "demo") {
    return new FixtureProfileProvider();
  }

  return new SpotifyProfileProvider();
}
