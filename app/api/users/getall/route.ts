import { NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
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

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select(["-password", "-createdAt", "-updatedAt", "-__v"])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();

    return NextResponse.json(
      {
        users,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
