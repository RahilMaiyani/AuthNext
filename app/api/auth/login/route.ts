import { NextResponse } from "next/server";
import User from "@/models/User";
import RefreshToken from "@/models/RefreshToken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // console.log("login: Email and password for login : ", email, password);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // console.log("login: User for the login : ", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid Password" },
        { status: 401 },
      );
    }

    if (user.status !== "approved") {
      if (user.status === "pending") {
        return NextResponse.json(
          { error: "Your account is pending admin approval." },
          { status: 403 },
        );
      } else {
        return NextResponse.json(
          { error: "Your account is rejected." },
          { status: 403 },
        );
      }
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // console.log("login: accesstoken : ", accessToken);
    // console.log("login: refreshtoken : ", refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // console.log("Is RefreshToken a valid model?", typeof RefreshToken.create);

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt,
    });

    (await cookies()).set("jwt_refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // console.log("login: successfull.");
    // console.log("Login successfull : ", {
    //   message: "Login successful",
    //   accessToken,
    //   user: { email: user.email, role: user.role, status: user.status },
    // });
    return NextResponse.json(
      {
        message: "Login successful",
        accessToken,
        user: {
          _id: user._id.toString(),
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: e.message },
      { status: 500 },
    );
  }
}
