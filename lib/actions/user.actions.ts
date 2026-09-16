"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import dbConnect from "../dbConnect";
import User from "@/models/User";

export const getUsers = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  "use cache";
  cacheTag("users", page.toString(), limit.toString());
  cacheLife("minutes");

  try {
    const skip = (page - 1) * limit;
    await dbConnect();

    const users = await User.find()
      .select(["-password", "-createdAt", "-updatedAt", "-__v"])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const serializedUsers = users.map((user: any) => ({
      ...user,
      _id: user._id.toString(),
    }));

    const totalUsers = await User.countDocuments();

    return {
      users: serializedUsers,
      totalPages: Math.ceil(totalUsers / limit),
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

    updateTag("users");

    return { message: "User status updated", user: serializedUser };
  } catch (e: any) {
    console.error("Error at approveUser :", e.message);
    return { error: e.message };
  }
};
