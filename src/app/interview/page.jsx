import InterviewSetup from "@/components/interview/InterviewSetup";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Start Interview — HireSense AI",
  description: "Configure your AI-powered mock interview. Select role, difficulty, experience level and generate tailored technical questions.",
};

export default function InterviewPage() {
  return (
    <DashboardShell
      title="Start Interview"
      subtitle="Configure your mock interview and let AI generate tailored questions based on your resume skills."
    >
      <InterviewSetup />
    </DashboardShell>
  );
}
