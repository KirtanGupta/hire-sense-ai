import ResumeUploader from "@/components/resume/ResumeUploader";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Resume — HireSense AI",
};

export default function ResumePage() {
  return (
    <DashboardShell title="Resume" subtitle="Upload or update your resume here.">
      <ResumeUploader />
    </DashboardShell>
  );
}
