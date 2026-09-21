"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import dbConnect from "../dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { revalidateTag } from "next/cache";

export const getUsers = async ({
  page,
  limit,
  search = "",
  role = "",
  status = "",
}: {
  page: number;
  limit: number;
  search: string;
  role: string;
  status: string;
}) => {
  "use cache";
  cacheTag("users", page.toString(), limit.toString(), search, role, status);
  cacheLife("minutes");

  try {
    const skip = (page - 1) * limit;
    await dbConnect();

    const query: any = {};
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select(["-password", "-createdAt", "-updatedAt", "-__v"])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const serializedUsers = users.map((user: any) => ({
      ...user,
      _id: user._id.toString(),
    }));

    const totalUsers = await User.countDocuments(query);

    return {
      users: serializedUsers,
      totalPages: Math.ceil(totalUsers / limit) || 1,
      currentPages: page,
    };
  } catch (e: any) {
    console.error("Error at getUsers :", e.message);
    return { users: [], totalPages: 0, currentPages: 1, error: e.message };
  }
};

export const getPendingUsers = async () => {
  try {
    await dbConnect();
    const pendingUsers = await User.find({ status: "pending" })
      .select(["-password", "-createdAt", "-updatedAt", "-__v"])
      .sort({ createdAt: -1 })
      .lean();

    const serializedUsers = pendingUsers.map((user: any) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return {
      message: "Successfully fetched all pending users",
      pendingUsers: serializedUsers,
    };
  } catch (e: any) {
    console.error("Error at getPendingUsers :", e.message);
    return { pendingUsers: [], error: e.message };
  }
};

export const changeUserStatus = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  try {
    await dbConnect();

    if (!id.trim() || !status) {
      return { error: "Parameters not received" };
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after", runValidators: true },
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return { error: "User not found" };
    }

    const serializedUser = { ...updatedUser, _id: updatedUser._id.toString() };

    revalidateTag("users", { expire: 0 });
    return { message: "User status updated", user: serializedUser };
  } catch (e: any) {
    console.error("Error at approveUser :", e.message);
    return { error: e.message };
  }
};

export const changeRole = async ({
  id,
  role,
}: {
  id: string;
  role: string;
}) => {
  try {
    await dbConnect();
    if (!id.trim() || !role) {
      return { error: "Parameters not received" };
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: "after", runValidators: true },
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return { error: "User not found" };
    }

    const serializedUser = { ...updatedUser, _id: updatedUser._id.toString() };

    revalidateTag("users", { expire: 0 });

    return { message: "User role updated", user: serializedUser };
  } catch (e: any) {
    console.error("Error at change role :", e.message);
    return { error: e.message };
  }
};

export const resetPassword = async ({
  userId = "",
  oldPassword,
  newPassword,
}: {
  userId: string | undefined;
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    await dbConnect();

    const user = await User.findById(userId).select("+password");

    if (!user) {
      console.log("User NOT found.");
      return { success: false, message: "User not found" };
    }

    const isOldPassMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPassMatch) {
      console.log("Old password Incorrect.");
      return { success: false, message: "Old password Incorrect." };
    }

    if (oldPassword === newPassword) {
      console.log("Password must be different from previous");
      return {
        success: false,
        message: "Password must be different from previous",
      };
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { returnDocument: "after" },
    );
    if (!updatedUser) {
      return { success: false, message: "Error reseting password" };
    }

    return { success: true, message: "Password successfully reseted." };
  } catch (e: any) {
    console.error("Error at reset password :", e.message);
    return { success: false, message: e.message };
  }
};

export const deleteUser = async (userId: string = "", id: string = "") => {
  try {
    await dbConnect();

    if (!userId.trim() || !id.trim()) {
      return { success: false, message: "Parameter not received" };
    }

    const user = await User.findById(id);
    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.role === "admin") {
      if (userId !== process.env.SUPER_ADMIN_ID) {
        return {
          success: false,
          message: "Forbidden: Only super admin can delete other admin.",
        };
      }
    }

    const deletedUser = await User.findByIdAndDelete(id, {
      returnDocument: "after",
    });

    if (!deletedUser) {
      return { success: false, message: "User not Deleted." };
    }

    revalidateTag("users", { expire: 0 });

    return { success: true, message: "Successfully deleted user" };
  } catch (e: any) {
    console.error("Error at reset password :", e.message);
    return { success: false, message: e.message };
  }
};
