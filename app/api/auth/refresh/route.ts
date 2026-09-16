import { NextResponse } from "next/server";
import RefreshToken from "@/models/RefreshToken";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { cookies } from "next/headers";
import { generateAccessToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const cookieStore = cookies();
    const refreshToken = (await cookieStore).get("jwt_refresh")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refreshtoken provided" },
        { status: 401 },
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    } catch (e) {
      (await cookies()).delete("jwt_refresh");
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 },
      );
    }

    const session = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: false,
    });

    if (!session) {
      (await cookies()).delete("jwt_refresh");
      return NextResponse.json(
        { error: "Session revoked or invalid" },
        { status: 401 },
      );
    }

    const user = await User.findById(decoded.userId)
      .select(["-createdAt", "-updatedAt", "-__v"])
      .lean();
    // console.log("decoded user in refresh : ", decoded);
    // console.log("User in refresh : ", user);
    if (!user || user.status !== "approved") {
      (await cookies()).delete("jwt_refresh");
      return NextResponse.json(
        { error: "User account disabled or pending" },
        { status: 403 },
      );
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.role);

    return NextResponse.json(
      {
        accessToken: newAccessToken,
        user,
      },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json({ message: "Internal Error." }, { status: 500 });
  }
}
