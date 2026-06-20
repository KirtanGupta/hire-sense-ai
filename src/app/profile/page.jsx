import DashboardShell from "@/components/dashboard/DashboardShell";
import ProfilePageClient from "@/components/profile/ProfilePageClient";

export const metadata = {
  title: "Profile — HireSense AI",
};

export default function ProfilePage() {
  return (
    <DashboardShell title="Profile" subtitle="Manage your profile information all in one place.">
      <ProfilePageClient />
    </DashboardShell>
  );
}
