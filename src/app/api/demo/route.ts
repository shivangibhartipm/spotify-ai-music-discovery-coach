import { NextResponse } from "next/server";

import { applySessionCookie } from "@/lib/auth/session";
import { env } from "@/lib/config/env";
import { formatConfigError } from "@/lib/config/errors";

export async function GET() {
  try {
    const response = NextResponse.redirect(new URL("/dashboard", env.APP_BASE_URL));

    await applySessionCookie(response, { mode: "demo" });

    return response;
  } catch (error) {
    const url = new URL("/", env.APP_BASE_URL);
    url.searchParams.set("authError", formatConfigError(error));

    return NextResponse.redirect(url);
  }
}
