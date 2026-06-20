import RoleSelector from "@/components/interview/RoleSelector";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Interview — HireSense AI",
};

export default function InterviewPage() {
  return (
    <DashboardShell title="Interview" subtitle="Choose a role and start practicing interview questions.">
      <RoleSelector />
    </DashboardShell>
  );
}
