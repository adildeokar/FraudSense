import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FraudSense AI — Real-Time Fraud Intelligence",
  description: "Production-grade AI-powered fraudulent transaction detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${syne.variable} ${jetbrains.variable} font-sans min-h-screen antialiased`}
        style={{
          backgroundColor: "#080c14",
          color: "#f1f5f9",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
