import InterviewReport from "@/components/interview/InterviewReport";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Interview Report — HireSense AI",
  description: "View your AI-generated interview performance report.",
};

export default async function ReportPage({ params }) {
  const { sessionId } = await params;

  return (
    <DashboardShell
      title="Interview Report"
      subtitle="Review your AI-evaluated performance, strengths, and areas for improvement."
    >
      <InterviewReport sessionId={sessionId} />
    </DashboardShell>
  );
}
