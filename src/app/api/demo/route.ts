import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth/session";
import { env } from "@/lib/config/env";
import { formatConfigError } from "@/lib/config/errors";

export async function GET() {
  try {
    await setSession({ mode: "demo" });

    return NextResponse.redirect(new URL("/dashboard", env.APP_BASE_URL));
  } catch (error) {
    const url = new URL("/", env.APP_BASE_URL);
    url.searchParams.set("authError", formatConfigError(error));

    return NextResponse.redirect(url);
  }
}
