"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/globalTypes";
import { useDebounce } from "@/hooks/useDebounce";
import { changeUserStatus, changeRole } from "@/lib/actions/user.actions";
import SelectedUsersModel from "@/components/admin/models/SelectedUsersModel";

export default function RosterPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [search, setSearch] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [roleUpdated, setRoleUpdated] = useState<number>(0);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await getUsers({
          page,
          limit: 10,
          search: debouncedSearch,
          role,
          status,
        });

        if (response.users) {
          setUsers(response.users);
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch directory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [page, debouncedSearch, role, status, roleUpdated]);

  const handleClearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  const handleReject = async (userId: string) => {
    try {
      await changeUserStatus({ id: userId, status: "rejected" });
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to reject user", error);
      alert("Failed to reject user. Please try again.");
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await changeUserStatus({ id: userId, status: "approved" });
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to approve user", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  const handleChangeRole = async (id: string, role: string) => {
    try {
      await changeRole({ id, role });
      setRoleUpdated(roleUpdated + 1);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to change role of user", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">All Users</h1>
      {/* Filter Bar */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6 flex flex-wrap gap-4 items-end">
        {/* Email Search */}
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Search Email
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Role Filter */}
        <div className="w-40">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-40">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      {/* Data Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700 uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Account ID</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500 animate-pulse"
                >
                  Loading database records...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-slate-700/30 transition-colors"
                  onClick={() => setSelectedUser(u)}
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {u._id}
                  </td>
                  <td className="px-6 py-4 text-white">{u.email}</td>
                  <td className="px-6 py-4 capitalize">{u.role}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        u.status === "pending"
                          ? "bg-amber-900/50 text-amber-400"
                          : u.status === "approved"
                            ? "bg-emerald-900/50 text-emerald-400"
                            : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || isLoading}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-all"
        >
          Previous
        </button>

        <span className="text-slate-400 font-medium">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-all"
        >
          Next
        </button>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <SelectedUsersModel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onChangeRole={handleChangeRole}
          onReject={handleReject}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
}
