import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized, no token found." },
        { status: 401 },
      );
    }
    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const user = await User.findById(decoded.userId.toString()).select(
      "+password",
    );
    // console.log(user.password);
    const { oldPassword, newPassword } = await req.json();

    const isOldPassMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPassMatch) {
      return NextResponse.json(
        { error: "Old password invalid." },
        { status: 401 },
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from old one." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { password: hashedPassword },
      { returnDocument: "after" },
    ).select("-password");
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User password change successfully." },
      { status: 200 },
    );
  } catch (e: any) {
    console.log("Error at reset password :", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
