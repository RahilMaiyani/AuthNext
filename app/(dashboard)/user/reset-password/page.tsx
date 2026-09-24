"use client";
import { useEffect, useState } from "react";
import { resetPassword } from "@/lib/actions/user.actions";
import { useAuth } from "@/app/context/AuthContext";

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);

const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Visibility states for each input
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!confirmation) return;
    const timer = setTimeout(() => setConfirmation(""), 10000);
    return () => clearTimeout(timer);
  }, [confirmation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (newPassword !== confirmPassword) {
        setError("Confirm password is not matching!");
        setIsSubmitting(false);
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
      setOldPassword("");
      setConfirmPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.log("Error at reset password : ", err.message);
      setError("Error resetting password");
    } finally {
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
      <div className="w-full max-w-xl bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Old Password */}
          <div>
            <label
              className="block text-md font-medium text-slate-300 mb-1"
              htmlFor="oldPassword"
            >
              Old Password:
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full pl-4 pr-11 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                aria-label={showOldPassword ? "Hide password" : "Show password"}
              >
                {showOldPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-md font-medium text-slate-300 mb-1"
            >
              New Password:
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-4 pr-11 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-md font-medium text-slate-300 mb-1"
            >
              Confirm Password:
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-4 pr-11 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-2 py-2.5 rounded-md font-medium text-white transition-colors ${
              isSubmitting
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
            }`}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
