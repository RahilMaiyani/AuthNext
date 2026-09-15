import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { success, z } from "zod";

const authSchema = z.object({
  email: z.email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 character long" })
    .max(64, { message: "Password is too long" }),
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

    // console.log("register: Email and password : ", email, password);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ email });

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
      role: "user",
      status: "pending",
    });

    // console.log("register: new user created : ", newUser);

    return NextResponse.json(
      { message: "User created successfully.", newUser },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
