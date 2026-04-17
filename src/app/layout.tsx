import type { Metadata } from "next";
import "./globals.css";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  title: "Amenti",
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
