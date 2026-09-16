"use client";

import { changeUserStatus, getPendingUsers } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/globalTypes";
import { useEffect, useState } from "react";

const Pending = () => {
  const [pendingUsers, setPendingUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const pu = await getPendingUsers();
        if (pu?.pendingUsers) {
          setPendingUsers(pu.pendingUsers);
        }
      } catch (error) {
        console.error("Failed to fetch pending users", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await changeUserStatus({ id: userId, status: "approved" });
      setPendingUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Failed to approve user", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await changeUserStatus({ id: userId, status: "rejected" });
      setPendingUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Failed to approve user", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  if (isLoading)
    return <div className="p-4 text-white">Loading pending users...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Pending Users :</h1>

      {pendingUsers.length === 0 ? (
        <p className="text-slate-400">No pending users to approve.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingUsers.map((p) => (
            <div
              className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700"
              key={p._id}
            >
              <div>
                <p className="text-white font-medium">{p.email}</p>
                <p className="text-sm text-slate-400">
                  Requested Role: {p.role}
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleApprove(p._id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 mx-4 rounded-md transition-colors shadow-sm"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(p._id)}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md transition-colors shadow-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pending;
