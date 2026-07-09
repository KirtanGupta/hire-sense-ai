import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "HireSense AI — Practice Smarter. Get Hired Faster.",
  description:
    "AI-powered mock interviews with voice recognition, resume analysis, and personalized feedback. Ace your next interview with HireSense AI.",
  keywords: "AI interview, mock interview, resume analysis, voice interview, job preparation, Gemini AI",
  authors: [{ name: "HireSense AI Team" }],
  openGraph: {
    title: "HireSense AI — Practice Smarter. Get Hired Faster.",
    description: "AI-powered mock interviews with voice recognition, resume analysis, and personalized feedback.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body style={{ minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
