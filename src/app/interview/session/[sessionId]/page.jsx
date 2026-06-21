import InterviewEngine from "@/components/interview/InterviewEngine";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Interview Session — HireSense AI",
  description: "Answer AI-generated interview questions and submit your session for evaluation.",
};

export default async function SessionPage({ params }) {
  const { sessionId } = await params;

  return (
    <DashboardShell
      title="Interview Session"
      subtitle="Read each question carefully and answer in your own words. Your answers autosave every 10 seconds."
    >
      <InterviewEngine sessionId={sessionId} />
    </DashboardShell>
  );
}
