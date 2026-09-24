"use server";

import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import dbConnect from "../dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "../auth";

export const register = async ({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role?: string;
}) => {
  try {
    await dbConnect();

    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { success: false, message: "Email and password are required." };
    }

    if (role) {
      if (!["user", "admin"].includes(role!)) {
        console.log("Invalid value of role");
        return { success: false, message: "Invalid value of role" };
      }
    }

    const existing = await User.exists({ email: normalizedEmail });

    if (existing) {
      console.log("User already exists.");
      return { success: false, message: "User already exists." };
    }

    const newUser = await User.create({
      email,
      password,
      role: role || "user",
      status: "pending",
    });

    if (!newUser) {
      return { success: false, message: "User registration failed" };
    }
    revalidateTag("users", { expire: 0 });

    console.log("User registered successfully.");
    return {
      success: true,
      message: "User registered successfully.",
    };
  } catch (e: any) {
    console.error("Error at register :", e.message);
    return { success: false, message: e.message };
  }
};

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
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return { success: false, message: auth.error };
    }

    const skip = (page - 1) * limit;
    await dbConnect();

    const query: any = {};
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select(["-password", "-createdAt", "-updatedAt", "-__v"])
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(query),
    ]);

    const serializedUsers = users.map((user: any) => ({
      ...user,
      _id: user._id.toString(),
    }));

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
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return { success: false, message: auth.error };
    }

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
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return { success: false, message: auth.error };
    }

    await dbConnect();

    if (!id.trim() || !status) {
      return { success: false, message: "Parameters not received" };
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after", runValidators: true },
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }

    // const serializedUser = { ...updatedUser, _id: updatedUser._id.toString() };

    revalidateTag("users", { expire: 0 });
    return { success: true, message: "User status updated" };
  } catch (e: any) {
    console.error("Error at approveUser :", e.message);
    return { success: false, message: e.message };
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
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return { success: false, message: auth.error };
    }

    await dbConnect();
    if (!id.trim() || !role) {
      return { success: false, message: "Parameters not received" };
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: "after", runValidators: true },
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }

    const serializedUser = { ...updatedUser, _id: updatedUser._id.toString() };

    revalidateTag("users", { expire: 0 });

    return {
      success: true,
      message: "User role updated",
      user: serializedUser,
    };
  } catch (e: any) {
    console.error("Error at change role :", e.message);
    return { success: false, message: e.message };
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

export const deleteUser = async (id: string = "") => {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return { success: false, message: auth.error };
    }

    const cleanTargetId = id.trim();
    if (!cleanTargetId) {
      return { success: false, message: "Target user ID not received." };
    }

    await dbConnect();

    const targetUser = await User.findById(cleanTargetId).select("role");
    if (!targetUser) {
      return { success: false, message: "User not found." };
    }

    if (targetUser.role === "admin") {
      if (auth.callerId !== process.env.SUPER_ADMIN_ID) {
        return {
          success: false,
          message: "Forbidden: Only super admin can delete another admin.",
        };
      }
    }

    const deletedUser = await User.findByIdAndDelete(cleanTargetId);
    if (!deletedUser) {
      return { success: false, message: "User not Deleted." };
    }

    revalidateTag("users", { expire: 0 });

    return { success: true, message: "Successfully deleted user" };
  } catch (e: any) {
    console.error("Error at deleteUser :", e.message);
    return { success: false, message: e.message };
  }
};
