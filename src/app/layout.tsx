import type { Metadata } from "next";
import "./globals.css";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://amentiaiaffiliates.online"
  ),
  title: "Signull",
  description: "AI-native CRM with site scraping & AI rebuilds",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
