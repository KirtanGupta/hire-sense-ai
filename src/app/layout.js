import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import { Toaster } from "react-hot-toast";

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
  keywords: "AI interview, mock interview, resume analysis, voice interview, job preparation, Groq AI",
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
      <body style={{ minHeight: "100vh" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0f172a",
              color: "#f1f5f9",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "0.75rem",
              padding: "0.85rem 1.1rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px)",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#0f172a" },
              style: {
                border: "1px solid rgba(34,197,94,0.3)",
                background: "rgba(15,23,42,0.95)",
              },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#0f172a" },
              style: {
                border: "1px solid rgba(248,113,113,0.3)",
                background: "rgba(15,23,42,0.95)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
