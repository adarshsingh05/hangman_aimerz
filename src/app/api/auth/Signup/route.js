import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import bcrypt from "bcryptjs";
import { createToken, getSetCookieHeader } from "../../../../../lib/auth";
export async function POST(req) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  await dbConnect();
  const exists = await User.findOne({ email });
  if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  const token = createToken(user._id.toString());
  const cookie = getSetCookieHeader(token);

  return NextResponse.json(
    { 
      user: { id: user._id, name: user.name, email: user.email },
      token: token // Include token in response for Authorization header
    },
    { status: 201, headers: { "Set-Cookie": cookie } }
  );
}
