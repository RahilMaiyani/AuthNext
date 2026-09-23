import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { success, z } from "zod";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";

const authSchema = z.object({
  email: z.email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 character long" })
    .max(64, { message: "Password is too long" }),
  role: z
    .enum(["user", "admin"], {
      message: "Invalid Role",
    })
    .default("user"),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const validationResult = authSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { email, password } = body;
    const { role } = body;
    // console.log("register: Email and password : ", email, password);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    if (role === "admin") {
      const authHeader = req.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const token = authHeader.split(" ")[1];
      let decoded: any;
      decoded = jwt.verify(token, process.env.JWT_SECRET!);

      if (decoded.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Admin access required for creating admin." },
          { status: 403 },
        );
      }
    }

    const existing = await User.exists({ email });

    // console.log("register: existing user : ", existing);

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const newUser = await User.create({
      email,
      password,
      role: role || "user",
      status: "pending",
    });

    // console.log("register: new user created : ", newUser);
    revalidateTag("users", { expire: 0 });

    return NextResponse.json(
      { message: "User created successfully.", newUser },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
