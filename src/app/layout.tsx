import type { Metadata } from "next";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Discovery Coach",
    template: "%s | AI Discovery Coach",
  },
  description:
    "A Spotify-powered AI discovery experience that helps listeners break out of their musical comfort zone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
