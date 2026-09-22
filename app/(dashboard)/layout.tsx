// app/(dashboard)/layout.tsx
"use client";

import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-2 rounded-xl transition-colors font-medium ${
      isActive ? "bg-blue-600 text-white" : "hover:bg-slate-700 text-slate-300"
    }`;
  };

  // Closes the menu automatically when a link is clicked on mobile
  const handleMobileNav = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Mobile Top Header (Visible only on md<) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-800 border-b border-slate-700 z-40 flex items-center justify-between px-4">
        <h2 className="text-xl font-bold text-blue-400">SystemPortal</h2>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-700 rounded-lg text-slate-300 active:scale-95 transition-transform"
        >
          {/* Hamburger Icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-full z-50 w-72 md:w-64 bg-slate-800 flex flex-col p-5 shadow-2xl md:shadow-lg border-r border-slate-700 
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="mb-8 flex justify-between items-start mt-4 md:mt-0">
          <div>
            <h2 className="text-2xl font-bold text-blue-400 hidden md:block">
              SystemPortal
            </h2>
            <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
            <p className="text-xs font-mono text-slate-500 uppercase mt-2 px-2 py-1 bg-slate-900 inline-block rounded-md border border-slate-700">
              Role: {user?.role}
            </p>
          </div>

          {/* Close button inside the drawer for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-700/50 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-2 grow">
          <Link
            href="/user"
            className={getLinkClass("/user")}
            onClick={handleMobileNav}
          >
            My Dashboard
          </Link>
          {user?.role === "admin" && (
            <>
              <Link
                href="/admin/pending"
                className={getLinkClass("/admin/pending")}
                onClick={handleMobileNav}
              >
                Pending Users
              </Link>
              <Link
                href="/admin/users"
                className={getLinkClass("/admin/users")}
                onClick={handleMobileNav}
              >
                User Directory
              </Link>
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-slate-700/50">
          <Link
            href="/user/reset-password"
            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
            onClick={handleMobileNav}
          >
            Reset Password
          </Link>
          <button
            onClick={() => {
              handleMobileNav();
              logout();
            }}
            className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors text-left"
          >
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Page Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-slate-900">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
