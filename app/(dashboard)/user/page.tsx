"use client";

import { useAuth } from "@/app/context/AuthContext";

export default function UserDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">My Dashboard</h1>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">
          Account Details
        </h2>

        <div className="space-y-4">
          <div>
            <span className="block text-sm text-slate-400">Email Address</span>
            <span className="text-lg text-white">{user.email}</span>
          </div>

          <div>
            <span className="block text-sm text-slate-400">Account ID</span>
            <span className="text-md font-mono text-slate-300">{user._id}</span>
          </div>

          <div className="flex gap-6">
            <div>
              <span className="block text-sm text-slate-400 mb-1">Role</span>
              <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded border border-blue-800 text-sm capitalize">
                {user.role}
              </span>
            </div>

            <div>
              <span className="block text-sm text-slate-400 mb-1">Status</span>
              <span
                className={`px-3 py-1 rounded border text-sm capitalize ${
                  user.status === "pending"
                    ? "bg-amber-900/50 text-amber-400 border-amber-800"
                    : "bg-emerald-900/50 text-emerald-400 border-emerald-800"
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Status Warning */}
        {user.status === "pending" && (
          <div className="mt-6 p-4 bg-amber-900/30 border border-amber-800 rounded-md">
            <p className="text-amber-200 text-sm">
              <strong>Notice:</strong> Your account is currently pending
              approval. Some features may be restricted until an administrator
              updates your status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
