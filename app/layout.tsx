import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VAP - AI Video Analytics Platform | Total Situational Awareness",
  description:
    "Transform your camera streams into actionable intelligence with VAP's AI-powered video analytics. Detect threats, optimize operations, and unlock business insights in real-time.",
  authors: [{ name: "VideoAnalyticsPro" }],
  openGraph: {
    title: "VAP - AI Video Analytics Platform",
    description:
      "Transform your camera streams into actionable intelligence with AI-powered video analytics.",
    type: "website",
    images: ["https://www.videoanalyticspro.com/vap-logo.jpeg"],
    url: "https://videoanalyticspro.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
