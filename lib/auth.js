import jwt from "jsonwebtoken";
import { parse, serialize } from "cookie";
import dbConnect from "./mongoose";
import User from "../models/users";
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in .env.local");
}

export function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function getSetCookieHeader(token) {
  return serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, 
  });
}

export async function getUserFromReq(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const { token } = parse(cookieHeader || "");
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.userId).select("-password");
    return user;
  } catch (err) {
    return null;
  }
}
