import { NextResponse } from "next/server";

import { clearSession } from "@/lib/auth/session";
import { env } from "@/lib/config/env";

export async function GET() {
  await clearSession();

  return NextResponse.redirect(new URL("/", env.APP_BASE_URL));
}
