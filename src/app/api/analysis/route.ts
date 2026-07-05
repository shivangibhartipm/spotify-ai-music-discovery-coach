import { NextResponse } from "next/server";

import { analyzeProfile } from "@/domain/analysis";
import { getProfileProvider } from "@/integration/profile-provider";
import { getValidSession } from "@/lib/auth/session";
import { formatConfigError } from "@/lib/config/errors";

export async function GET() {
  const session = await getValidSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const provider = getProfileProvider(session);
    const profile = await provider.getProfile(session);
    const analysis = analyzeProfile(profile);

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      {
        error: formatConfigError(error),
      },
      {
        status: 500,
      },
    );
  }
}
