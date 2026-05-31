import type { Metadata } from "next";
import { Graduate, Space_Mono } from "next/font/google";
import "./globals.css";

const graduate = Graduate({
  variable: "--font-graduate",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DED Design — Emulate The Greats",
  description: "Extract computed CSS tokens and layout heuristics from any live URL into a structured Markdown file optimized for LLM context windows.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect x='4' y='28' width='56' height='32' fill='%238A0303'/><rect x='4' y='4' width='12' height='28' fill='%238A0303'/><rect x='20' y='4' width='12' height='22' fill='%238A0303'/><rect x='36' y='4' width='12' height='28' fill='%238A0303'/><rect x='16' y='4' width='4' height='28' fill='%230A0A0A'/><rect x='32' y='4' width='4' height='28' fill='%230A0A0A'/><rect x='48' y='4' width='12' height='22' fill='%238A0303'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${graduate.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}