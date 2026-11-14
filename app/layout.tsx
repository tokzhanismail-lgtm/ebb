import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ebb — cravings come in waves",
  description:
    "Ebb is a skill trainer for emotional eating. Notice the urge, pause, and choose on purpose. No diets, no calories, no shame.",
};

export const viewport: Viewport = {
  themeColor: "#12313a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
