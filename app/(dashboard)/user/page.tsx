"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const { logout } = useAuth();

  const router = useRouter();

  const handleLogout = async () => {
    logout();

    router.push("/login");
  };
  return (
    <div>
      <h1>User Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
