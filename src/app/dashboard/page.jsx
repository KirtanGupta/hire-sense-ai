import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import RecentInterviews from "@/components/dashboard/RecentInterviews";

export const metadata = {
  title: "Dashboard — HireSense AI",
};

export default function DashboardPage() {
  return (
    <DashboardShell title="Dashboard" subtitle="Your activity and interview progress at a glance.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard title="Active Sessions" value="12" description="Sessions completed this week" />
        <StatCard title="Interviews" value="8" description="Interviews taken this month" />
        <StatCard title="Success Rate" value="92%" description="Estimated performance score" />
      </div>
      <RecentInterviews />
    </DashboardShell>
  );
}
