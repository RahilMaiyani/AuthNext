import dbConnect from "./dbConnect";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/models/User";

interface TokenPayload {
  userId: string;
  role?: string;
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt_refresh")?.value;

  if (!token) {
    return {
      authorized: false,
      error: "Unauthorized: No refresh token found.",
    };
  }

  try {
    const decoded = (await jwt.verify(
      token,
      process.env.JWT_REFRESH_SECREt!,
    )) as TokenPayload;

    await dbConnect();
    const caller = await User.findById(decoded.userId).select("role").lean();

    if (!caller || caller.role !== "admin") {
      return {
        authorized: false,
        error: "Forbidden: Admin privilages required.",
      };
    }

    return {
      authorized: true,
      callerId: decoded.userId,
      callerRole: decoded.role,
    };
  } catch (e) {
    return {
      authorized: false,
      error: "Unauthorized: Invalid or expired session.",
    };
  }
}
