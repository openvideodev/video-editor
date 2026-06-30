import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Figtree, Albert_Sans, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const figtreeHeading = Figtree({ subsets: ["latin"], variable: "--font-heading" });

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter-sans" });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "OpenVideo - Open Source Video Editor",
    template: "%s | OpenVideo",
  },
  description:
    "Open-source Video Editor with client-side rendering (WebCodecs). Edit videos directly in your browser.",
  keywords: [
    "video editor",
    "open source",
    "open source video editor",
    "free video editor",
    "webcodecs",
    "browser video editing",
    "github",
  ],
  authors: [{ name: "OpenVideo" }],
  creator: "OpenVideo",
  metadataBase: new URL("https://openvideo.dev"),
  openGraph: {
    title: "OpenVideo - Open Source Video Editor",
    description:
      "Free, open-source Video Editor with client-side rendering (WebCodecs). Edit videos in your browser.",
    url: "https://openvideo.dev",
    siteName: "OpenVideo",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OpenVideo - Video Editor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenVideo - Open Source Video Editor",
    description:
      "Free, open-source Video Editor with client-side rendering (WebCodecs). Edit videos in your browser.",
    images: ["/og.png"],
    creator: "@openvideo",
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
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        geistMono.variable,
        figtree.variable,
        inter.variable,
        figtreeHeading.variable,
        "font-sans",
      )}
    >
      <head />
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
