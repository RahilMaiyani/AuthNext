"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getUsers } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/globalTypes";
import { useDebounce } from "@/hooks/useDebounce";
import {
  changeUserStatus,
  changeRole,
  deleteUser,
} from "@/lib/actions/user.actions";
import SelectedUsersModel from "@/components/admin/models/SelectedUsersModel";
import { UserTableRow } from "@/components/admin/UserTableRow";
import toast from "react-hot-toast";
import { success } from "zod";

export default function RosterPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [search, setSearch] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const debouncedSearch = useDebounce(search, 500);
  const activeRefreshId = useRef(0);

  const fetchUsers = useCallback(async () => {
    const currentRefreshId = ++activeRefreshId.current;
    setIsLoading(true);
    try {
      const response = await getUsers({
        page,
        limit: 10,
        search: debouncedSearch,
        role,
        status,
      });

      if (currentRefreshId !== activeRefreshId.current) {
        return;
      }

      if (response.users) {
        setUsers(response.users);
        setTotalPages(response.totalPages);

        if (response.users.length === 0 && page > 1) {
          setPage((p) => p - 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch directory:", error);
    } finally {
      if (currentRefreshId === activeRefreshId.current) {
        setIsLoading(false);
      }
    }
  }, [page, debouncedSearch, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleClearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  const handleSelectUser = useCallback((u: IUser) => {
    setSelectedUser(u);
  }, []);

  const handleChangeUserStatus = async (status: string) => {
    if (!selectedUser?._id) return;

    const targetId = selectedUser._id;
    const targetEmail = selectedUser.email;

    try {
      const res = await changeUserStatus({ id: targetId, status });

      if (res?.success === false) {
        alert(res.message || `Failed to ${status} user.`);
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === targetId ? { ...u, status } : u)),
      );

      toast.success(`${targetEmail} is ${status}`);
      setSelectedUser(null);
    } catch (error) {
      console.error(`Failed to update status to ${status}`, error);
      alert(`Failed to update user. Please try again.`);
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      const res = await changeRole({ id, role: newRole });

      if (res?.success === false) {
        alert(res.message || `Failed to ${newRole} user.`);
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)),
      );
      if (selectedUser) {
        toast.success(`${selectedUser.email} is now ${newRole}`);
      }
      setSelectedUser(null);
    } catch (error) {
      console.log("Failed to change role of user", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const targetId = selectedUser._id;
    const targetEmail = selectedUser.email;

    try {
      const res = await deleteUser(targetId);

      if (!res.success) {
        alert(res.message || `Failed to delete user.`);
        return;
      }

      toast(`${targetEmail} is Deleted`);
      setSelectedUser(null);
      await fetchUsers();
      // console.log(response.message);
    } catch (error: any) {
      console.log("Failed to delete user", error.message);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleSearch = (e: any) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">All Users</h1>

      {/* Filter Bar */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Search Email
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e)}
            placeholder="Search by email..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="w-40">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="w-40">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-700 hover:bg-red-500/90 text-slate-300 text-sm rounded-xl transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-lg:overflow-scroll lg:overflow-hidden shadow-xl">
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
                <UserTableRow
                  key={u._id}
                  user={u}
                  onSelect={handleSelectUser}
                />
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
          {"<"}
        </button>

        <span className="text-slate-400 font-medium">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-all"
        >
          {">"}
        </button>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <SelectedUsersModel
          user={selectedUser}
          onClose={handleCloseModal}
          onChangeRole={handleChangeRole}
          onApprove={() => handleChangeUserStatus("approved")}
          onReject={() => handleChangeUserStatus("rejected")}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
}
