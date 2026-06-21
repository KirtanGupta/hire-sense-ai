import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Panel — HireSense AI",
  description: "HireSense AI administration panel",
};

export default function AdminLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#020617",
        color: "#f8fafc",
      }}
    >
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          padding: "2rem 2.5rem",
          overflowX: "hidden",
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
