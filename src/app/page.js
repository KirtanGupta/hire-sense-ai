import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import ResumeSection from "@/components/landing/ResumeSection";
import VoiceInterviewSection from "@/components/landing/VoiceInterviewSection";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import About from "@/components/landing/About";
import TechStack from "@/components/landing/TechStack";
import FAQ from "@/components/landing/FAQ";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "HireSense AI — Practice Smarter. Get Hired Faster.",
  description:
    "AI-powered mock interviews with voice recognition, resume analysis, and personalized feedback. Ace your next job interview with HireSense AI.",
  keywords: [
    "AI interview",
    "mock interview",
    "resume analysis",
    "voice interview",
    "job preparation",
    "Groq AI",
    "interview practice",
  ],
};

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", position: "relative", zIndex: 1 }}>
      <div className="noise-overlay" />

      <Navbar />
      <Hero />
      <Features />
      <ResumeSection />
      <VoiceInterviewSection />
      <HowItWorks />
      <WhyChooseUs />
      <About />
      <TechStack />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
