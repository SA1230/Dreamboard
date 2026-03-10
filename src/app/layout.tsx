import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { TrackerProvider } from "@/components/TrackerProvider";
import { GameDataProvider } from "@/components/GameDataProvider";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const viewport = {
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  title: "Dreamboard",
  description: "Level up your real life — track habits, earn XP, and grow your character",
  openGraph: {
    title: "Dreamboard",
    description: "Level up your real life — track habits, earn XP, and grow your character",
    siteName: "Dreamboard",
  },
  twitter: {
    card: "summary",
    title: "Dreamboard",
    description: "Level up your real life — track habits, earn XP, and grow your character",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased bg-[#FDF8F4] text-stone-700 min-h-screen`}>
        <AuthProvider>
          <TrackerProvider>
            <GameDataProvider>{children}</GameDataProvider>
          </TrackerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
