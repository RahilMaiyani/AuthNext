// app/(dashboard)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-2 rounded-md transition-colors ${
      isActive ? "bg-blue-600 text-white" : "hover:bg-slate-700 text-slate-300"
    }`;
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-800 flex flex-col p-4 shadow-lg border-r border-slate-700">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-400">SystemPortal</h2>
          <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
          <p className="text-xs font-mono text-slate-500 uppercase mt-1 px-2 py-0.5 bg-slate-900 inline-block rounded">
            Role: {user?.role}
          </p>
        </div>

        <nav className="flex flex-col gap-2 grow">
          <Link href="/user" className={getLinkClass("/user")}>
            My Dashboard
          </Link>
          {user?.role === "admin" && (
            <>
              <Link
                href="/admin/pending"
                className={getLinkClass("/admin/pending")}
              >
                Pending Users
              </Link>
              <Link
                href="/admin/users"
                className={getLinkClass("/admin/users")}
              >
                User Directory
              </Link>
            </>
          )}
        </nav>

        {/* Bottom Action */}
        <button
          onClick={logout}
          className="mt-auto px-4 py-2 text-left text-red-400 hover:bg-slate-700 rounded-md transition-colors"
        >
          Logout Session
        </button>
      </aside>

      {/* Main Page Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
