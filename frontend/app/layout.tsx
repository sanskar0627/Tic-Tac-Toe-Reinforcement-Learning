import type { Metadata } from "next";
import { Bungee, IBM_Plex_Mono, Manrope } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const display = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.kicker}`,
  description: BRAND.blurb,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${display.variable} ${body.variable} ${mono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
