"use server";

import { cacheLife, cacheTag } from "next/cache";
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
    console.log("Error at user.action :", e.message);
    return { users: [], totalPages: 0, currentPages: 1, error: e.message };
  }
};
