import DashboardShell from "@/components/dashboard/DashboardShell";
import ProfilePageClient from "@/components/profile/ProfilePageClient";

export const metadata = {
  title: "Profile — HireSense AI",
  description: "View and manage your HireSense AI profile, interview stats, and account settings.",
};

export default function ProfilePage() {
  return (
    <DashboardShell>
      <ProfilePageClient />
    </DashboardShell>
  );
}
