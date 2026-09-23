import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader?.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid or expired access token" },
        { status: 401 },
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const user = await User.findById(userId);
    if (user.role === "admin") {
      if (!(decoded.userId === process.env.SUPER_ADMIN_ID)) {
        return NextResponse.json(
          { message: "Forbidden: Only super admin can remove admins" },
          { status: 403 },
        );
      }
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const deletedUser = await User.findByIdAndDelete(userId, {
      returnDocument: "after",
    });

    if (!deletedUser) {
      return NextResponse.json(
        { message: "User not deleted" },
        { status: 500 },
      );
    }

    revalidateTag("users", { expire: 0 });

    return NextResponse.json(
      {
        message: "Successfully removed user.",
        deletedUser,
      },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
