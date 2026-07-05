import { NextRequest, NextResponse } from "next/server";

import { decryptCookieValue, SESSION_COOKIE_NAME, type AppSession } from "@/lib/auth/session-core";

function isValidSession(session: AppSession | null): session is AppSession {
  if (!session) {
    return false;
  }

  if (session.mode === "demo") {
    return true;
  }

  return (
    session.mode === "spotify" &&
    Boolean(session.accessToken) &&
    Boolean(session.refreshToken) &&
    typeof session.expiresAt === "number"
  );
}

export async function proxy(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!secret || secret.length < 32) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const session = await decryptCookieValue<AppSession>(cookieValue, secret);

  if (!isValidSession(session)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
