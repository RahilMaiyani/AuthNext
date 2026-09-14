import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RefreshToken from "@/models/RefreshToken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const refreshToken = (await cookieStore).get("jwt_refresh")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token not provided" },
        { status: 401 },
      );
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    (await cookies()).delete("jwt_refresh");

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
