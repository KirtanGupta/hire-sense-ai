import DashboardShell from "@/components/dashboard/DashboardShell";
import HistoryList from "@/components/history/HistoryList";

export const metadata = {
  title: "History — HireSense AI",
};

export default function HistoryPage() {
  return (
    <DashboardShell title="History" subtitle="Review your past interviews and performance records.">
      <HistoryList />
    </DashboardShell>
  );
}
