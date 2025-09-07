import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import bcrypt from "bcryptjs";
import { createToken, getSetCookieHeader } from "../../../../../lib/auth";

export async function POST(req) {
  try {

    const { email, password } = await req.json();

    if (!email || !password) {
      console.error("Missing email or password");
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.error("Password mismatch for user:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createToken(user._id.toString());
    const cookie = getSetCookieHeader(token);
  

    return NextResponse.json(
      { 
        user: { id: user._id, name: user.name, email: user.email },
        token: token // Include token in response for Authorization header
      },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
