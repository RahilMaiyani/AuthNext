import AdminAlerts from "@/components/admin/models/AdminAlerts";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <AdminAlerts />
      <main>{children}</main>
    </div>
  );
}
