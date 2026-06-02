import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spectraldrift.vercel.app"),
  title: "Spectral Drift — Open World Multiplayer Ghost Realm",
  description:
    "A peer-to-peer open world where ghost spirits roam, collect cryptographic orbs and connect with others in real time. No servers. No accounts. Just your 12-word seed phrase and the void.",
  keywords:
    "spectral drift, multiplayer, p2p game, ghost world, crypto orbs, browser game, webrtc, open world, no server",
  authors: [{ name: "Aryan S Rao", url: "https://aryansrao.vercel.app" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  openGraph: {
    type: "website",
    url: "https://spectraldrift.vercel.app/",
    title: "Spectral Drift — Open World Multiplayer Ghost Realm",
    description:
      "Peer-to-peer ghost world. Collect cryptographic orbs. No servers, no accounts — just your seed phrase and the void.",
    siteName: "Spectral Drift",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectral Drift — Open World Multiplayer Ghost Realm",
    description:
      "Peer-to-peer ghost world. Collect cryptographic orbs. No servers, no accounts — just your seed phrase and the void.",
    images: ["/og.png"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='%23ff4500' d='m256 30c-90 0-164 68-173 156-33 237-79 276-79 276-15 25 21 28 39 28 35 0 35 40 70 40s35-35 71-35 37 45 72 45 37-45 72-45 35 35 71 35 35-40 70-40c18 0 54-3 39-28 0 0-46-39-79-276-9-88-83-156-173-156z'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
