"use client";
import { useEffect, useState } from "react";
import { resetPassword } from "@/lib/actions/user.actions";
import { useAuth } from "@/app/context/AuthContext";

const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const { user, isLoading } = useAuth();

  useEffect(() => {
    setTimeout(() => setConfirmation(""), 10000);
  }, [confirmation]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      if (oldPassword !== confirmPassword) {
        setError("Confirm password is not matching!");
        return;
      }
      const response = await resetPassword({
        userId: user?._id,
        oldPassword,
        newPassword,
      });

      if (!response.success) {
        setError(response.message);
        return;
      }
      setConfirmation("Password changed successfully.");
    } catch (err: any) {
      console.log("Error at reset password : ", err.message);
      const errorMsg = "Error reseting password";
      setError(errorMsg);
    } finally {
      setOldPassword("");
      setConfirmPassword("");
      setNewPassword("");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Reset Password
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {confirmation && (
          <div className="mb-4 p-3 bg-emerald-900/50 border border-emerald-500 rounded text-emerald-200 text-sm">
            {confirmation}
          </div>
        )}

        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label
              className="block text-sm font-medium text-slate-300 mb-1"
              htmlFor="oldPassword"
            >
              Old Password :
            </label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <br />
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Confirm Password :
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <br />
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              New Password :
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <br />
            <button>
              <input
                disabled={isSubmitting}
                type="submit"
                value="Reset Password"
                className={`w-full py-2.5 rounded-md font-medium text-white transition-colors ${
                  isSubmitting
                    ? "bg-blue-600/50 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                }`}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
