import "server-only";

import type { ListeningProfile } from "@/domain/profile/listening-profile";
import type { ProfileProvider } from "@/integration/profile-provider";
import demoProfile from "@/fixtures/demo-profile.json";
import { listeningProfileSchema } from "@/lib/validation/profile";

const validatedDemoProfile = listeningProfileSchema.parse(demoProfile);

export class FixtureProfileProvider implements ProfileProvider {
  async getProfile(): Promise<ListeningProfile> {
    return validatedDemoProfile;
  }
}
