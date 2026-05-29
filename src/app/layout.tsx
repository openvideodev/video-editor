import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "OpenVideo - Free Open Source Video Editor | Browser-Based Rendering",
  description:
    "OpenVideo is a free, open-source video editor with browser-based rendering using WebCodecs. No downloads required - edit videos entirely in your browser. AI-powered features included.",
  keywords: [
    "video editor",
    "open source video editor",
    "free video editor",
    "browser video editor",
    "web-based video editor",
    "client-side rendering",
    "WebCodecs",
    "AI video editor",
    "online video editing",
  ],
  authors: [{ name: "OpenVideo" }],
  creator: "OpenVideo",
  publisher: "OpenVideo",
  metadataBase: new URL("https://example-react.openvideo.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OpenVideo - Free Open Source Video Editor",
    description:
      "Free, open-source video editor with browser-based rendering. No downloads, edit entirely in your browser with AI features.",
    url: "https://example-react.openvideo.dev",
    siteName: "OpenVideo",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenVideo - Free Open Source Video Editor",
    description:
      "Free, open-source video editor with browser-based rendering. Edit videos entirely in your browser.",
    creator: "@openvideodev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geistMono.variable, "font-sans", outfit.variable)}
    >
      <head />
      <body className={`antialiased dark`}>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
