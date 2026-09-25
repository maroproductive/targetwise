import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "@fontsource-variable/noto-sans-arabic";
import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  title: {
    default: "TargetWise — Strategy, creative & digital",
    template: "%s | TargetWise",
  },
  description:
    "Marketing strategy, paid advertising, content, branding and websites. Tell TargetWise about your business.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: {
    capable: true,
    title: "TargetWise",
    statusBarStyle: "default",
  },
};
export const viewport: Viewport = {
  themeColor: "#123C46",
  width: "device-width",
  initialScale: 1,
};
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
