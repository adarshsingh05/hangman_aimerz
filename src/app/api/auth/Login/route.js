import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import bcrypt from "bcryptjs";
import { createToken, getSetCookieHeader } from "../../../../../lib/auth";
export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing" }, { status: 400 });
  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = createToken(user._id.toString());
  const cookie = getSetCookieHeader(token);

  return NextResponse.json(
    { user: { id: user._id, name: user.name, email: user.email } },
    { status: 200, headers: { "Set-Cookie": cookie } }
  );
}
