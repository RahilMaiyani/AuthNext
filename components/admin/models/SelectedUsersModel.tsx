import { useState } from "react";
import { IUser } from "@/lib/globalTypes";

interface UserModalProps {
  user: IUser;
  onClose: () => void;
  onChangeRole: (id: string, role: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
}

export default function UserModal({
  user,
  onClose,
  onChangeRole,
  onReject,
  onApprove,
}: UserModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRoleClick = async (role: string) => {
    setIsProcessing(true);
    await onChangeRole(user._id, role);
    setIsProcessing(false);
  };

  const handleRejectClick = async () => {
    setIsProcessing(true);
    await onReject(user._id);
    setIsProcessing(false);
  };

  const handleApproveClick = async () => {
    setIsProcessing(true);
    await onApprove(user._id);
    setIsProcessing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          Manage User Access
        </h2>

        {/* User Details */}
        <div className="mb-6 space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <p className="text-sm">
            <span className="text-slate-400 inline-block w-20">ID:</span>
            <span className="font-mono text-slate-300">{user._id}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-400 inline-block w-20">Email:</span>
            <span className="text-white">{user.email}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-400 inline-block w-20">Role:</span>
            <span className="text-white capitalize">{user.role}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-400 inline-block w-20">Status:</span>
            <span
              className={`capitalize ml-1 ${
                user.status === "pending"
                  ? "text-amber-400"
                  : user.status === "approved"
                    ? "text-emerald-400"
                    : "text-slate-400"
              }`}
            >
              {user.status}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              disabled={isProcessing || user.role === "admin"}
              onClick={() => handleRoleClick("admin")}
              className="flex-1 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Make Admin
            </button>
            <button
              disabled={isProcessing || user.role === "user"}
              onClick={() => handleRoleClick("user")}
              className="flex-1 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Make User
            </button>
          </div>
          <div className="flex gap-2">
            <button
              disabled={isProcessing || user.status === "approved"}
              onClick={handleApproveClick}
              className="flex-1 py-2 bg-emerald-900/40 text-emerald-400 border border-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Approve User Access
            </button>
            <button
              disabled={isProcessing || user.status === "rejected"}
              onClick={handleRejectClick}
              className="flex-1 py-2 bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-600 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Reject User Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
