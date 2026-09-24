"use client";

import { IUser } from "@/lib/globalTypes";

interface UserTableRowProps {
  user: IUser;
  onSelect: (user: IUser) => void;
}

export const UserTableRow = function UserTableRow({
  user,
  onSelect,
}: UserTableRowProps) {
  return (
    <tr
      className="hover:bg-slate-700/30 transition-colors cursor-pointer"
      onClick={() => onSelect(user)}
    >
      <td className="px-6 py-4 font-mono text-xs text-slate-500">{user._id}</td>
      <td className="px-6 py-4 text-white">{user.email}</td>
      <td className="px-6 py-4 capitalize">{user.role}</td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-2 rounded-full text-xs capitalize ${
            user.status === "pending"
              ? "bg-amber-900/50 text-amber-400"
              : user.status === "approved"
                ? "bg-emerald-900/50 text-emerald-400"
                : "bg-slate-700 text-slate-300"
          }`}
        >
          {user.status}
        </span>
      </td>
    </tr>
  );
};
